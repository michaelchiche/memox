import { randomUUID } from "crypto";
import type { Topic, TopicSummary, GenerationMetadata } from "../types/index.js";
import { getDatabase } from "./database.js";
import { createGeneration, getSummaryGeneration } from "./generations.js";

export const DEFAULT_TOPIC_NAME = "Non classée";

interface TopicRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface SummaryRow {
  id: string;
  topic_id: string;
  version: number;
  content: string;
  generated_at: string;
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

function rowToSummary(row: SummaryRow): TopicSummary {
  return {
    id: row.id,
    topicId: row.topic_id,
    version: row.version,
    content: row.content,
    generatedAt: new Date(row.generated_at),
  };
}

export function createTopic(
  name: string,
  description?: string
): Topic {
  const db = getDatabase();
  const id = randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO topics (id, name, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, name, description || null, now, now);

  return {
    id,
    name,
    description,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

export function getTopicById(id: string): Topic | null {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT id, name, description, created_at, updated_at
    FROM topics
    WHERE id = ?
  `).get(id) as TopicRow | undefined;

  if (!row) return null;

  return rowToTopic(row);
}

export function getTopicByName(name: string): Topic | null {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT id, name, description, created_at, updated_at
    FROM topics
    WHERE name = ?
  `).get(name) as TopicRow | undefined;

  if (!row) return null;

  return rowToTopic(row);
}

export function getAllTopics(): Topic[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT id, name, description, created_at, updated_at
    FROM topics
    ORDER BY name COLLATE NOCASE
  `).all() as TopicRow[];

  return rows.map(rowToTopic);
}

export function updateTopic(
  id: string,
  updates: Partial<Pick<Topic, "name" | "description">>
): Topic | null {
  const db = getDatabase();
  const now = new Date().toISOString();

  const setClauses: string[] = ["updated_at = ?"];
  const values: unknown[] = [now];

  if (updates.name !== undefined) {
    setClauses.push("name = ?");
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    setClauses.push("description = ?");
    values.push(updates.description);
  }

  values.push(id);

  const stmt = db.prepare(`
    UPDATE topics
    SET ${setClauses.join(", ")}
    WHERE id = ?
  `);

  stmt.run(...values);

  return getTopicById(id);
}

export function renameTopic(oldName: string, newName: string): Topic | null {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    UPDATE topics
    SET name = ?, updated_at = ?
    WHERE name = ?
  `);

  const result = stmt.run(newName, now, oldName);
  
  if (result.changes === 0) return null;
  
  return getTopicByName(newName);
}

export function deleteTopic(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare("DELETE FROM topics WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getNoteCountForTopic(topicId: string): number {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT COUNT(*) as count
    FROM note_topics
    WHERE topic_id = ?
  `).get(topicId) as { count: number };

  return row.count;
}

export function getOrCreateDefaultTopic(): Topic {
  let topic = getTopicByName(DEFAULT_TOPIC_NAME);
  if (!topic) {
    topic = createTopic(DEFAULT_TOPIC_NAME, "Notes without classification");
  }
  return topic;
}

export function addSummaryVersion(
  topicId: string,
  content: string,
  metadata?: GenerationMetadata
): TopicSummary {
  const db = getDatabase();
  
  const maxVersionRow = db.prepare(`
    SELECT MAX(version) as max_version
    FROM topic_summaries
    WHERE topic_id = ?
  `).get(topicId) as { max_version: number | null };
  
  const nextVersion = (maxVersionRow.max_version || 0) + 1;
  const id = randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO topic_summaries (id, topic_id, version, content, generated_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, topicId, nextVersion, content, now);

  if (metadata) {
    createGeneration('topic_summary', id, metadata);
  }

  return {
    id,
    topicId,
    version: nextVersion,
    content,
    generatedAt: new Date(now),
    generatedBy: metadata,
  };
}

export function getLatestSummary(topicId: string): TopicSummary | null {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT id, topic_id, version, content, generated_at
    FROM topic_summaries
    WHERE topic_id = ?
    ORDER BY version DESC
    LIMIT 1
  `).get(topicId) as SummaryRow | undefined;

  if (!row) return null;

  const summary = rowToSummary(row);
  const metadata = getSummaryGeneration(summary.id);
  
  return {
    ...summary,
    generatedBy: metadata || undefined,
  };
}

export function getSummaryHistory(topicId: string): TopicSummary[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT id, topic_id, version, content, generated_at
    FROM topic_summaries
    WHERE topic_id = ?
    ORDER BY version DESC
  `).all(topicId) as SummaryRow[];

  return rows.map(row => {
    const summary = rowToSummary(row);
    const metadata = getSummaryGeneration(summary.id);
    return {
      ...summary,
      generatedBy: metadata || undefined,
    };
  });
}