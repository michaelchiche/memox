import fs from "fs";
import path from "path";
import { globSync } from "glob";
import { getDatabase } from "./database.js";
import { computeHash } from "./hash.js";
import { createNote, getNoteByPath, updateNote, deleteNote } from "./notes.js";
import { getOrCreateDefaultTopic, getTopicByName, createTopic } from "./topics.js";
import { setNoteTopics, getTopicsForNote } from "./associations.js";
import { parseNoteFrontmatter, serializeNoteFrontmatter, extractTitleFromContent } from "./frontmatter.js";
import type { Note, NoteFrontmatter, Config } from "../types/index.js";

export interface NoteFile {
  path: string;
  content: string;
  frontmatter: NoteFrontmatter;
  body: string;
}

export interface SyncResult {
  note: Note;
  status: "created" | "updated" | "conflict" | "unchanged";
  conflictData?: {
    dbTopics: string[];
    fileTopics: string[];
  };
}

export function readNoteFile(filePath: string): NoteFile {
  const content = fs.readFileSync(filePath, "utf-8");
  const { frontmatter, content: body } = parseNoteFrontmatter(content);
  
  return {
    path: filePath,
    content,
    frontmatter,
    body,
  };
}

export function writeNoteFile(
  filePath: string,
  body: string,
  frontmatter: NoteFrontmatter
): void {
  const content = serializeNoteFrontmatter(body, frontmatter);
  fs.writeFileSync(filePath, content, "utf-8");
}

export function ensureNoteFile(filePath: string, title: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(filePath)) {
    const frontmatter: NoteFrontmatter = {
      title,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    writeNoteFile(filePath, "", frontmatter);
  }
}

export function importNoteFromPath(
  filePath: string,
  storePath: string
): Note {
  const relativePath = path.relative(storePath, filePath);
  const noteFile = readNoteFile(filePath);
  const hash = computeHash(noteFile.content);
  const title = noteFile.frontmatter.title || extractTitleFromContent(noteFile.body, path.basename(filePath));
  
  let note = getNoteByPath(relativePath);
  
  if (note) {
    if (note.hash !== hash) {
      note = updateNote(note.id, {
        content: noteFile.body,
        title,
        hash,
      });
    }
  } else {
    note = createNote({
      path: relativePath,
      content: noteFile.body,
      title,
      hash,
    });
  }
  
  if (noteFile.frontmatter.topics && noteFile.frontmatter.topics.length > 0) {
    const topicIds: string[] = [];
    
    for (const topicName of noteFile.frontmatter.topics) {
      let topic = getTopicByName(topicName);
      if (!topic) {
        topic = createTopic(topicName);
      }
      topicIds.push(topic.id);
    }
    
    setNoteTopics(note.id, topicIds);
  }
  
  return note;
}

export function importNotesFromDirectory(
  dirPath: string,
  storePath: string
): Note[] {
  const pattern = path.join(dirPath, "**/*.md").replace(/\\/g, "/");
  const files = globSync(pattern);
  const notes: Note[] = [];
  
  for (const file of files) {
    const note = importNoteFromPath(file, storePath);
    notes.push(note);
  }
  
  return notes;
}

export function syncNoteToDb(note: Note, filePath: string): void {
  if (!fs.existsSync(filePath)) {
    deleteNote(note.id);
    return;
  }
  
  const noteFile = readNoteFile(filePath);
  const hash = computeHash(noteFile.content);
  
  if (hash !== note.hash) {
    const title = noteFile.frontmatter.title || extractTitleFromContent(noteFile.body, path.basename(filePath));
    updateNote(note.id, {
      content: noteFile.body,
      title,
      hash,
    });
    
    if (noteFile.frontmatter.topics) {
      const topicIds: string[] = [];
      for (const topicName of noteFile.frontmatter.topics) {
        let topic = getTopicByName(topicName);
        if (!topic) {
          topic = createTopic(topicName);
        }
        topicIds.push(topic.id);
      }
      setNoteTopics(note.id, topicIds);
    }
  }
}

export function syncAllNotes(storePath: string): SyncResult[] {
  const results: SyncResult[] = [];
  
  const pattern = path.join(storePath, "**/*.md").replace(/\\/g, "/");
  const files = globSync(pattern);
  
  for (const file of files) {
    const relativePath = path.relative(storePath, file);
    const noteFile = readNoteFile(file);
    const hash = computeHash(noteFile.content);
    const title = noteFile.frontmatter.title || extractTitleFromContent(noteFile.body, path.basename(file));
    
    let note = getNoteByPath(relativePath);
    let status: SyncResult["status"] = "unchanged";
    
    if (!note) {
      note = createNote({
        path: relativePath,
        content: noteFile.body,
        title,
        hash,
      });
      status = "created";
    } else if (note.hash !== hash) {
      note = updateNote(note.id, {
        content: noteFile.body,
        title,
        hash,
      });
      status = "updated";
    }
    
    if (noteFile.frontmatter.topics) {
      const topicIds: string[] = [];
      for (const topicName of noteFile.frontmatter.topics) {
        let topic = getTopicByName(topicName);
        if (!topic) {
          topic = createTopic(topicName);
        }
        topicIds.push(topic.id);
      }
      setNoteTopics(note.id, topicIds);
    }
    
    results.push({ note, status });
  }
  
  return results;
}

export function detectConflict(note: Note, filePath: string): { hasConflict: boolean; dbTopics: string[]; fileTopics: string[] } | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const noteFile = readNoteFile(filePath);
  const fileHash = computeHash(noteFile.content);
  
  if (fileHash === note.hash) {
    return null;
  }
  
  const dbTopics = getTopicsForNote(note.id).map(t => t.name);
  const fileTopics = noteFile.frontmatter.topics || [];
  
  const dbTopicsSorted = [...dbTopics].sort();
  const fileTopicsSorted = [...fileTopics].sort();
  
  if (JSON.stringify(dbTopicsSorted) !== JSON.stringify(fileTopicsSorted)) {
    return {
      hasConflict: true,
      dbTopics,
      fileTopics,
    };
  }
  
  return null;
}