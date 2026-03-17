import { randomUUID } from "crypto";
import { saveGeneration, getGenerationForEntity } from "./database.js";
import type { GenerationMetadata } from "../types/index.js";

export function createGeneration(
  entityType: 'note' | 'topic_summary' | 'topic_proposal',
  entityId: string,
  metadata: GenerationMetadata
): void {
  saveGeneration({
    id: randomUUID(),
    entityType,
    entityId,
    provider: metadata.provider,
    model: metadata.model,
    tokensUsed: metadata.tokensUsed,
    generatedAt: new Date(),
  });
}

export function getNoteGeneration(noteId: string): GenerationMetadata | null {
  const row = getGenerationForEntity('note', noteId);
  if (!row) return null;
  return {
    provider: row.provider,
    model: row.model,
    tokensUsed: row.tokensUsed ?? undefined,
  };
}

export function getSummaryGeneration(summaryId: string): GenerationMetadata | null {
  const row = getGenerationForEntity('topic_summary', summaryId);
  if (!row) return null;
  return {
    provider: row.provider,
    model: row.model,
    tokensUsed: row.tokensUsed ?? undefined,
  };
}