import { randomUUID } from "crypto";
import type { Note } from "../types/index.js";
import { getDatabase } from "./database.js";

interface NoteRow {
  id: string;
  path: string;
  title: string | null;
  content: string;
  hash: string;
  created_at: string;
  updated_at: string;
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

export function createNote(
  noteData: Omit<Note, "id" | "createdAt" | "updatedAt">,
): Note {
  const db = getDatabase();
  const id = randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO notes (id, path, title, content, hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    noteData.path,
    noteData.title,
    noteData.content,
    noteData.hash,
    now,
    now,
  );

  return {
    id,
    path: noteData.path,
    title: noteData.title,
    content: noteData.content,
    hash: noteData.hash,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

export function getNoteById(id: string): Note | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `
    SELECT id, path, title, content, hash, created_at, updated_at
    FROM notes
    WHERE id = ?
  `,
    )
    .get(id) as NoteRow | undefined;

  if (!row) return null;

  return rowToNote(row);
}

export function getNoteByPath(path: string): Note | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `
    SELECT id, path, title, content, hash, created_at, updated_at
    FROM notes
    WHERE path = ?
  `,
    )
    .get(path) as NoteRow | undefined;

  if (!row) return null;

  return rowToNote(row);
}

export function getAllNotes(): Note[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `
    SELECT id, path, title, content, hash, created_at, updated_at
    FROM notes
    ORDER BY updated_at DESC
  `,
    )
    .all() as NoteRow[];

  return rows.map(rowToNote);
}

export function updateNote(
  id: string,
  updates: Partial<Pick<Note, "title" | "content" | "hash">>,
): Note | null {
  const db = getDatabase();
  const now = new Date().toISOString();

  const setClauses: string[] = ["updated_at = ?"];
  const values: unknown[] = [now];

  if (updates.title !== undefined) {
    setClauses.push("title = ?");
    values.push(updates.title);
  }
  if (updates.content !== undefined) {
    setClauses.push("content = ?");
    values.push(updates.content);
  }
  if (updates.hash !== undefined) {
    setClauses.push("hash = ?");
    values.push(updates.hash);
  }

  values.push(id);

  const stmt = db.prepare(`
    UPDATE notes
    SET ${setClauses.join(", ")}
    WHERE id = ?
  `);

  stmt.run(...values);

  return getNoteById(id);
}

export function deleteNote(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare("DELETE FROM notes WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getNotesByTopicId(topicId: string): Note[] {
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

export function getNotesWithoutTopics(): Note[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `
    SELECT n.id, n.path, n.title, n.content, n.hash, n.created_at, n.updated_at
    FROM notes n
    LEFT JOIN note_topics nt ON n.id = nt.note_id
    WHERE nt.note_id IS NULL
    ORDER BY n.updated_at DESC
  `,
    )
    .all() as NoteRow[];

  return rows.map(rowToNote);
}
