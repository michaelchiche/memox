// Library entry point
export type {
  Note,
  NoteFrontmatter,
  Topic,
  TopicSummary,
  NoteSummary,
  TopicMatch,
  TopicProposal,
  Config,
  ImportResult,
  GenerationMetadata,
  Generation,
} from "./types/index.js";

export type { LLMProvider } from "./providers/types.js";
export { OllamaProvider } from "./providers/ollama.js";
export { createProvider } from "./providers/index.js";

export { loadConfig, saveConfig, getDefaultConfig } from "./lib/config.js";
export { initDatabase, closeDatabase, getDatabase } from "./lib/database.js";
export {
  createNote,
  getNoteById,
  getNoteByPath,
  getAllNotes,
} from "./lib/notes.js";
export { createTopic, getTopicByName, getAllTopics } from "./lib/topics.js";
export {
  setNoteTopics,
  getTopicsForNote,
  getNotesForTopic,
} from "./lib/associations.js";
export { computeHash } from "./lib/hash.js";
