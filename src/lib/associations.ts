import type { Note, Topic } from "../types/index.js";
import { getDatabase } from "./database.js";

interface TopicRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface NoteRow {
  id: string;
  path: string;
  title: string | null;
  content: string;
  hash: string;
  created_at: string;
  updated_at: string;
}

function rowToTopic(row: TopicRow): Topic {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    path: row.path,
    title: row.title || "Untitled",
    content: row.content,
    hash: row.hash,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function associateNoteWithTopic(noteId: string, topicId: string): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO note_topics (note_id, topic_id, created_at)
    VALUES (?, ?, ?)
  `);

  stmt.run(noteId, topicId, now);
}

export function dissociateNoteFromTopic(noteId: string, topicId: string): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    DELETE FROM note_topics
    WHERE note_id = ? AND topic_id = ?
  `);

  stmt.run(noteId, topicId);
}

export function getTopicsForNote(noteId: string): Topic[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `
    SELECT t.id, t.name, t.description, t.created_at, t.updated_at
    FROM topics t
    INNER JOIN note_topics nt ON t.id = nt.topic_id
    WHERE nt.note_id = ?
    ORDER BY t.name COLLATE NOCASE
  `,
    )
    .all(noteId) as TopicRow[];

  return rows.map(rowToTopic);
}

export function setNoteTopics(noteId: string, topicIds: string[]): void {
  const db = getDatabase();

  const transaction = db.transaction(() => {
    const deleteStmt = db.prepare("DELETE FROM note_topics WHERE note_id = ?");
    deleteStmt.run(noteId);

    const insertStmt = db.prepare(`
      INSERT INTO note_topics (note_id, topic_id, created_at)
      VALUES (?, ?, ?)
    `);

    const now = new Date().toISOString();
    for (const topicId of topicIds) {
      insertStmt.run(noteId, topicId, now);
    }
  });

  transaction();
}

export function getNotesForTopic(topicId: string): Note[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `
    SELECT n.id, n.path, n.title, n.content, n.hash, n.created_at, n.updated_at
    FROM notes n
    INNER JOIN note_topics nt ON n.id = nt.note_id
    WHERE nt.topic_id = ?
    ORDER BY n.updated_at DESC
  `,
    )
    .all(topicId) as NoteRow[];

  return rows.map(rowToNote);
}

export function removeAllTopicAssociations(topicId: string): void {
  const db = getDatabase();
  db.prepare("DELETE FROM note_topics WHERE topic_id = ?").run(topicId);
}

export function removeAllNoteAssociations(noteId: string): void {
  const db = getDatabase();
  db.prepare("DELETE FROM note_topics WHERE note_id = ?").run(noteId);
}
