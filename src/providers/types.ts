import type { Note, Topic, TopicMatch, TopicProposal, GenerationMetadata } from "../types/index.js";

export interface LLMProvider {
  classifyNote(note: Note, existingTopics: Topic[]): Promise<{
    rankedTopics: TopicMatch[];
    suggestedNewTopics: string[];
    metadata: GenerationMetadata;
  }>;
  
  summarizeTopic(topic: Topic, notes: Note[]): Promise<{
    content: string;
    metadata: GenerationMetadata;
  }>;
  
  summarizeNote(note: Note): Promise<{
    content: string;
    metadata: GenerationMetadata;
  }>;
  
  proposeTopics(notes: Note[]): Promise<{
    proposals: TopicProposal[];
    metadata: GenerationMetadata;
  }>;
  
  generateText(prompt: string): Promise<{
    content: string;
    metadata: GenerationMetadata;
  }>;
  
  isAvailable(): Promise<boolean>;
}

export type { TopicMatch, TopicProposal, GenerationMetadata } from "../types/index.js";