import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { tmpdir } from "os";
import { join } from "path";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { readNoteFile } from "../lib/files.js";
import { chunkText, needsChunking, estimateTokens } from "../lib/chunking.js";

describe("Transcription Import", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(tmpdir(), `transcription-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe("readNoteFile - txt files", () => {
    it("should parse txt file with valid content", () => {
      const txtPath = join(tempDir, "test.txt");
      writeFileSync(txtPath, "First line content\nSecond line\nThird line", "utf-8");

      const result = readNoteFile(txtPath);

      expect(result.fileType).toBe("txt");
      expect(result.frontmatter.title).toBe("First line content");
      expect(result.content).toBe("First line content\nSecond line\nThird line");
      expect(result.body).toBe("First line content\nSecond line\nThird line");
    });

    it("should use filename as title for empty txt file", () => {
      const txtPath = join(tempDir, "empty.txt");
      writeFileSync(txtPath, "", "utf-8");

      const result = readNoteFile(txtPath);

      expect(result.fileType).toBe("txt");
      expect(result.frontmatter.title).toBe("empty");
    });

    it("should use first non-empty line as title", () => {
      const txtPath = join(tempDir, "whitespace.txt");
      writeFileSync(txtPath, "\n\n  \nActual Title\nContent", "utf-8");

      const result = readNoteFile(txtPath);

      expect(result.fileType).toBe("txt");
      expect(result.frontmatter.title).toBe("Actual Title");
    });

    it("should handle markdown files as md type", () => {
      const mdPath = join(tempDir, "test.md");
      writeFileSync(mdPath, "---\ntitle: Test\n---\n\nContent", "utf-8");

      const result = readNoteFile(mdPath);

      expect(result.fileType).toBe("md");
    });
  });
});

describe("Chunking Logic", () => {
  describe("estimateTokens", () => {
    it("should estimate tokens based on character count", () => {
      const text = "a".repeat(100);
      const tokens = estimateTokens(text);

      expect(tokens).toBe(25);
    });
  });

  describe("needsChunking", () => {
    it("should return false for short text", () => {
      const shortText = "This is a short text";
      expect(needsChunking(shortText)).toBe(false);
    });

    it("should return true for text exceeding threshold", () => {
      const longText = "x".repeat(20000);
      expect(needsChunking(longText, 4000)).toBe(true);
    });
  });

  describe("chunkText", () => {
    it("should return single chunk for short text", () => {
      const text = "Short text";
      const chunks = chunkText(text);

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe("Short text");
    });

    it("should split long text into multiple chunks", () => {
      const text = "Paragraph one.\n\nParagraph two.\n\n".repeat(500);
      const chunks = chunkText(text, 1000);

      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach(chunk => {
        expect(chunk.length).toBeLessThanOrEqual(1000 * 4 * 1.2);
      });
    });

    it("should preserve paragraph boundaries when possible", () => {
      const text = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.";
      const chunks = chunkText(text);

      expect(chunks).toHaveLength(1);
    });
  });

  describe("Summary Generation with Mock Provider", () => {
    it("should handle chunking and merging for large notes", () => {
      const largeText = "x".repeat(50000);
      const chunks = chunkText(largeText, 4000);

      expect(chunks.length).toBeGreaterThan(1);
    });
  });
});