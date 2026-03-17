import { randomUUID } from "crypto";
import type { NoteSummary, GenerationMetadata, Note } from "../types/index.js";
import type { LLMProvider } from "../providers/types.js";
import { getDatabase } from "./database.js";
import { createGeneration, getNoteSummaryGeneration } from "./generations.js";
import { chunkText, needsChunking } from "./chunking.js";
import { buildMergeSummariesPrompt, buildChunkSummaryPrompt } from "../prompts/summarize.js";

interface NoteSummaryRow {
  id: string;
  note_id: string;
  version: number;
  content: string;
  generated_at: string;
}

function rowToNoteSummary(row: NoteSummaryRow): NoteSummary {
  return {
    id: row.id,
    noteId: row.note_id,
    version: row.version,
    content: row.content,
    generatedAt: new Date(row.generated_at),
  };
}

export function createNoteSummary(
  noteId: string,
  content: string,
  metadata?: GenerationMetadata
): NoteSummary {
  const db = getDatabase();
  
  const maxVersionRow = db.prepare(`
    SELECT MAX(version) as max_version
    FROM note_summaries
    WHERE note_id = ?
  `).get(noteId) as { max_version: number | null };
  
  const nextVersion = (maxVersionRow.max_version || 0) + 1;
  const id = randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO note_summaries (id, note_id, version, content, generated_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, noteId, nextVersion, content, now);

  if (metadata) {
    createGeneration('note_summary', id, metadata);
  }

  return {
    id,
    noteId,
    version: nextVersion,
    content,
    generatedAt: new Date(now),
    generatedBy: metadata,
  };
}

export function getLatestNoteSummary(noteId: string): NoteSummary | null {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT id, note_id, version, content, generated_at
    FROM note_summaries
    WHERE note_id = ?
    ORDER BY version DESC
    LIMIT 1
  `).get(noteId) as NoteSummaryRow | undefined;

  if (!row) return null;

  const summary = rowToNoteSummary(row);
  const metadata = getNoteSummaryGeneration(summary.id);
  
  return {
    ...summary,
    generatedBy: metadata || undefined,
  };
}

export function getNoteSummaryHistory(noteId: string): NoteSummary[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT id, note_id, version, content, generated_at
    FROM note_summaries
    WHERE note_id = ?
    ORDER BY version DESC
  `).all(noteId) as NoteSummaryRow[];

  return rows.map(row => {
    const summary = rowToNoteSummary(row);
    const metadata = getNoteSummaryGeneration(summary.id);
    return {
      ...summary,
      generatedBy: metadata || undefined,
    };
  });
}

export function getNoteSummaryById(id: string): NoteSummary | null {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT id, note_id, version, content, generated_at
    FROM note_summaries
    WHERE id = ?
  `).get(id) as NoteSummaryRow | undefined;

  if (!row) return null;

  const summary = rowToNoteSummary(row);
  const metadata = getNoteSummaryGeneration(summary.id);
  
  return {
    ...summary,
    generatedBy: metadata || undefined,
  };
}

export function deleteNoteSummary(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare("DELETE FROM note_summaries WHERE id = ?").run(id);
  return result.changes > 0;
}

export async function summarizeNote(
  note: Note,
  provider: LLMProvider
): Promise<NoteSummary> {
  if (needsChunking(note.content)) {
    const chunks = chunkText(note.content);
    const chunkSummaries: string[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunkPrompt = buildChunkSummaryPrompt(chunks[i], i, chunks.length);
      const { content } = await provider.generateText(chunkPrompt);
      chunkSummaries.push(content);
    }
    
    const mergePrompt = buildMergeSummariesPrompt(chunkSummaries);
    const { content, metadata } = await provider.generateText(mergePrompt);
    return createNoteSummary(note.id, content, metadata);
  }
  
  const { content, metadata } = await provider.summarizeNote(note);
  return createNoteSummary(note.id, content, metadata);
}