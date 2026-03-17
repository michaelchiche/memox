import { describe, it, expect, vi, beforeEach } from "vitest";
import { OllamaProvider } from "../providers/ollama.js";
import type { Note, Topic } from "../types/index.js";

// Mock fetch for testing
global.fetch = vi.fn();

describe("OllamaProvider", () => {
  let provider: OllamaProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new OllamaProvider({ baseUrl: "http://localhost:11434", model: "test-model" });
  });

  describe("isAvailable", () => {
    it("should return true when Ollama is running", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });
      
      const result = await provider.isAvailable();
      
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:11434/api/tags");
    });

    it("should return false when Ollama is not running", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Connection refused"));
      
      const result = await provider.isAvailable();
      
      expect(result).toBe(false);
    });
  });

  describe("classifyNote", () => {
    it("should return ranked topics and suggestions", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          response: JSON.stringify({
            rankedTopics: [{ topicName: "Alpha", confidence: 85 }],
            suggestedNewTopics: ["Beta", "Gamma"],
          }),
          eval_count: 50,
        }),
      });

      const note: Note = {
        id: "test-id",
        path: "test.md",
        title: "Test Note",
        content: "This is a test note about Alpha project",
        hash: "test-hash",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const topics: Topic[] = [
        { id: "topic-1", name: "Alpha", createdAt: new Date(), updatedAt: new Date() },
      ];

      const result = await provider.classifyNote(note, topics);

      expect(result.rankedTopics).toHaveLength(1);
      expect(result.rankedTopics[0].confidence).toBe(85);
      expect(result.suggestedNewTopics).toContain("Beta");
      expect(result.metadata.provider).toBe("ollama");
      expect(result.metadata.model).toBe("test-model");
    });

    it("should handle LLM errors gracefully", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

      const note: Note = {
        id: "test-id",
        path: "test.md",
        title: "Test Note",
        content: "Test content",
        hash: "test-hash",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await provider.classifyNote(note, []);

      expect(result.rankedTopics).toHaveLength(0);
      expect(result.suggestedNewTopics).toHaveLength(0);
    });
  });

  describe("summarizeTopic", () => {
    it("should generate summary for topic", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          response: "This is a summary",
          eval_count: 10,
        }),
      });

      const topic: Topic = {
        id: "topic-1",
        name: "Alpha",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const notes: Note[] = [
        {
          id: "note-1",
          path: "test.md",
          title: "Test",
          content: "Content",
          hash: "hash",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = await provider.summarizeTopic(topic, notes);

      expect(result.content).toContain("This is a summary");
      expect(result.metadata.provider).toBe("ollama");
      expect(result.metadata.model).toBe("test-model");
    });
  });

  describe("proposeTopics", () => {
    it("should propose topics from notes", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          response: JSON.stringify({
            proposals: [
              { name: "Project Alpha", description: "Notes about Alpha", sampleNotes: ["note1"] },
            ],
          }),
          eval_count: 20,
        }),
      });

      const notes: Note[] = [
        {
          id: "note-1",
          path: "test.md",
          title: "Test",
          content: "Content",
          hash: "hash",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = await provider.proposeTopics(notes);

      expect(result.proposals).toHaveLength(1);
      expect(result.proposals[0].name).toBe("Project Alpha");
      expect(result.metadata.provider).toBe("ollama");
      expect(result.metadata.model).toBe("test-model");
    });
  });
});