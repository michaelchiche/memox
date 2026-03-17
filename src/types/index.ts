export interface Note {
  id: string;
  path: string;
  title: string;
  content: string;
  hash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteFrontmatter {
  title?: string;
  topics?: string[];
  created?: string;
  updated?: string;
  generatedBy?: { provider: string; model: string };
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TopicSummary {
  id: string;
  topicId: string;
  version: number;
  content: string;
  generatedAt: Date;
  generatedBy?: { provider: string; model: string };
}

export interface NoteSummary {
  id: string;
  noteId: string;
  version: number;
  content: string;
  generatedAt: Date;
  generatedBy?: { provider: string; model: string };
}

export interface TopicMatch {
  topic: Topic;
  confidence: number;
}

export interface TopicProposal {
  name: string;
  description: string;
  sampleNotes: string[];
}

export interface Config {
  storePath: string;
  dbPath: string;
  llm: {
    provider: "ollama" | "openai";
    model: string;
    baseUrl?: string;
    apiKey?: string;
  };
  defaultTopic: string;
}

export interface ImportResult {
  note: Note;
  suggestedTopics: TopicMatch[];
  proposedNewTopics: string[];
  existingTopics: Topic[];
}

export interface GenerationMetadata {
  provider: string;
  model: string;
  tokensUsed?: number;
}

export interface Generation {
  id: string;
  entityType: 'note' | 'topic_summary' | 'topic_proposal' | 'note_summary';
  entityId: string;
  provider: string;
  model: string;
  tokensUsed?: number;
  generatedAt: Date;
}