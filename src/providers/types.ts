import type { Note, Topic, TopicMatch, TopicProposal } from "../types/index.js";

export interface LLMProvider {
  classifyNote(note: Note, existingTopics: Topic[]): Promise<{
    rankedTopics: TopicMatch[];
    suggestedNewTopics: string[];
  }>;
  
  summarizeTopic(topic: Topic, notes: Note[]): Promise<string>;
  
  proposeTopics(notes: Note[]): Promise<TopicProposal[]>;
  
  isAvailable(): Promise<boolean>;
}

export type { TopicMatch, TopicProposal } from "../types/index.js";