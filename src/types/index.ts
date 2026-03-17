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