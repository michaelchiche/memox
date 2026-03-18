import type { Note, Topic, TopicMatch, TopicProposal, GenerationMetadata } from "../types/index.js";
import type { LLMProvider } from "./types.js";
import { buildTranscriptionSummaryPrompt } from "../prompts/summarize.js";
import { buildKeywordExtractionPrompt, buildTopicClassificationPrompt } from "../prompts/classify.js";

interface OllamaGenerateResponse {
  response: string;
  eval_count?: number;
}

interface OllamaConfig {
  baseUrl: string;
  model: string;
}

interface GenerateResult {
  response: string;
  metadata: GenerationMetadata;
}

export class OllamaProvider implements LLMProvider {
  private baseUrl: string;
  private model: string;

  constructor(config?: Partial<OllamaConfig>) {
    this.baseUrl = config?.baseUrl || "http://localhost:11434";
    this.model = config?.model || "llama3.2";
  }

  async classifyNote(note: Note, existingTopics: Topic[]): Promise<{
    rankedTopics: TopicMatch[];
    suggestedNewTopics: string[];
    metadata: GenerationMetadata;
  }> {
    try {
      // Step 1: Extract keywords
      const keywordsPrompt = buildKeywordExtractionPrompt(note.content);
      const { response: keywordsRaw } = await this.generate(keywordsPrompt);
      const keywords = this.parseKeywordsResponse(keywordsRaw);
      
      // Step 2: Classify based on keywords
      const existingTopicNames = existingTopics.map(t => t.name);
      const classifyPrompt = buildTopicClassificationPrompt(keywords, existingTopicNames);
      const { response: classifyRaw, metadata } = await this.generate(classifyPrompt);
      
      const result = this.parseClassificationResponse(classifyRaw, existingTopics);
      
      // Filter by confidence threshold >= 50%
      result.rankedTopics = result.rankedTopics.filter(t => t.confidence >= 50);
      
      return { ...result, metadata };
    } catch (error) {
      return { 
        rankedTopics: [], 
        suggestedNewTopics: [], 
        metadata: { provider: 'ollama', model: this.model } 
      };
    }
  }

  async summarizeTopic(topic: Topic, notes: Note[]): Promise<{
    content: string;
    metadata: GenerationMetadata;
  }> {
    const notesContent = notes
      .map(n => `## ${n.title}\n${n.content.substring(0, 1000)}`)
      .join("\n\n")
      .substring(0, 8000);

    const prompt = `Summarize the following notes from the topic "${topic.name}".

Notes:
${notesContent}

Provide a concise summary (2-3 paragraphs) that:
1. Identifies the main themes
2. Highlights key points or decisions
3. Notes any actions or follow-ups mentioned

Summary:`;

    try {
      const { response, metadata } = await this.generate(prompt);
      return { content: response.trim(), metadata };
    } catch (error) {
      throw new Error(`Failed to generate summary: ${error}`);
    }
  }

  async summarizeNote(note: Note): Promise<{
    content: string;
    metadata: GenerationMetadata;
  }> {
    const prompt = buildTranscriptionSummaryPrompt(note);

    try {
      const { response, metadata } = await this.generate(prompt);
      return { content: response.trim(), metadata };
    } catch (error) {
      throw new Error(`Failed to generate summary: ${error}`);
    }
  }

  async proposeTopics(notes: Note[]): Promise<{
    proposals: TopicProposal[];
    metadata: GenerationMetadata;
  }> {
    const notesContent = notes
      .slice(0, 20)
      .map(n => `## ${n.title}\n${n.content.substring(0, 500)}`)
      .join("\n\n")
      .substring(0, 6000);

    const prompt = `Analyze these notes and propose topics to organize them.

Notes:
${notesContent}

Propose 3-5 topic names with brief descriptions.
Respond in JSON format:
{
  "proposals": [
    {"name": "Topic Name", "description": "Brief description", "sampleNotes": ["title1", "title2"]}
  ]
}`;

    try {
      const { response, metadata } = await this.generate(prompt);
      const parsed = this.parseProposalsResponse(response);
      return { proposals: parsed, metadata };
    } catch (error) {
      return { 
        proposals: [], 
        metadata: { provider: 'ollama', model: this.model } 
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateText(prompt: string): Promise<{
    content: string;
    metadata: GenerationMetadata;
  }> {
    const { response, metadata } = await this.generate(prompt);
    return { content: response.trim(), metadata };
  }

  private async generate(prompt: string): Promise<GenerateResult> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = (await response.json()) as OllamaGenerateResponse;
    return {
      response: data.response,
      metadata: {
        provider: 'ollama',
        model: this.model,
        tokensUsed: data.eval_count,
      },
    };
  }

  private parseClassificationResponse(
    response: string,
    existingTopics: Topic[]
  ): { rankedTopics: TopicMatch[]; suggestedNewTopics: string[] } {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { rankedTopics: [], suggestedNewTopics: [] };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      const rankedTopics: TopicMatch[] = (parsed.rankedTopics || [])
        .map((item: { topicName: string; confidence: number }) => {
          const topic = existingTopics.find((t: Topic) => t.name === item.topicName);
          if (topic) {
            return { topic, confidence: item.confidence };
          }
          return null;
        })
        .filter((t: TopicMatch | null): t is TopicMatch => t !== null);

      const suggestedNewTopics: string[] = (parsed.suggestedNewTopics || [])
        .filter((item: unknown): item is string => typeof item === "string")
        .slice(0, 5);

      return { rankedTopics, suggestedNewTopics };
    } catch {
      return { rankedTopics: [], suggestedNewTopics: [] };
    }
  }

  private parseKeywordsResponse(response: string): string[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return [];
      }
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item: unknown): item is string => typeof item === "string")
          .slice(0, 20);
      }
      return [];
    } catch {
      return [];
    }
  }

  private parseProposalsResponse(response: string): TopicProposal[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return (parsed.proposals || []).map((p: { name: string; description: string; sampleNotes?: string[] }) => ({
        name: p.name,
        description: p.description,
        sampleNotes: p.sampleNotes || [],
      }));
    } catch {
      return [];
    }
  }
}