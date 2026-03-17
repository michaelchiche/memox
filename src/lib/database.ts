/**
 * Database module for memo CLI.
 * 
 * Manages SQLite database initialization, schema creation, and connection handling.
 * Uses better-sqlite3 for synchronous SQLite operations with FTS5 full-text search.
 * 
 * @module database
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import os from "os";
import type { Config } from "../types/index.js";

const DEFAULT_STORE_PATH = path.join(os.homedir(), "memo");
const DEFAULT_DB_NAME = "memo.db";

/** Active database connection */
let db: Database.Database | null = null;

/**
 * Get the default storage path for notes.
 * @returns Default path (~/memo/)
 */
export function getDefaultStorePath(): string {
  return DEFAULT_STORE_PATH;
}

/**
 * Get the default database path.
 * @returns Default database file path (~/memo/memo.db)
 */
export function getDefaultDbPath(): string {
  return path.join(DEFAULT_STORE_PATH, DEFAULT_DB_NAME);
}

/**
 * Ensure storage directories exist.
 * Creates store and database directories if they don't exist.
 * @param config - Configuration object with paths
 */
export function ensureDirectories(config: Config): void {
  if (!fs.existsSync(config.storePath)) {
    fs.mkdirSync(config.storePath, { recursive: true });
  }
  const dbDir = path.dirname(config.dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

/**
 * Initialize the database with schema.
 * Creates all required tables and indexes.
 * Uses WAL mode for better concurrent access.
 * 
 * @param dbPath - Path to SQLite database file
 * @returns Database connection instance
 */
export function initDatabase(dbPath: string): Database.Database {
  if (db) {
    return db;
  }

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  createSchema(db);
  
  return db;
}

/**
 * Get the active database connection.
 * @throws Error if database not initialized
 * @returns Database connection instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase first.");
  }
  return db;
}

/**
 * Close the database connection.
 * Safe to call multiple times.
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Create the database schema.
 * Includes tables for notes, topics, associations, summaries, and FTS5 index.
 * 
 * Schema:
 * - topics: id, name, description, timestamps
 * - notes: id, path, title, content, hash, timestamps
 * - note_topics: junction table (note_id, topic_id)
 * - topic_summaries: versioned summaries
 * - notes_fts: full-text search virtual table
 * 
 * @param database - Database connection
 */
function createSchema(database: Database.Database): void {
  database.exec(`
    -- Topics table
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_topics_name ON topics(name);
    
    -- Notes table
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      path TEXT UNIQUE NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_notes_path ON notes(path);
    
    -- Note-Topics junction table (N:N)
    CREATE TABLE IF NOT EXISTS note_topics (
      note_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (note_id, topic_id),
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_note_topics_note ON note_topics(note_id);
    CREATE INDEX IF NOT EXISTS idx_note_topics_topic ON note_topics(topic_id);
    
    -- Topic summaries table (versioned)
    CREATE TABLE IF NOT EXISTS topic_summaries (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      content TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_summaries_topic ON topic_summaries(topic_id);
    
    -- FTS5 virtual table for full-text search
    CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
      title,
      content,
      content='notes',
      content_rowid='rowid'
    );
    
    -- Triggers to keep FTS in sync
    CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
      INSERT INTO notes_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content);
    END;
    
    CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
      INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', old.rowid, old.title, old.content);
    END;
    
    CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
      INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', old.rowid, old.title, old.content);
      INSERT INTO notes_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content);
    END;
  `);
}