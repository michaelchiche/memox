import { describe, it, expect } from "vitest";
import { computeHash } from "../lib/hash.js";
import { parseNoteFrontmatter, serializeNoteFrontmatter, extractTitleFromContent } from "../lib/frontmatter.js";

describe("Hash Utility", () => {
  it("should compute consistent hash", () => {
    const content = "test content";
    const hash1 = computeHash(content);
    const hash2 = computeHash(content);
    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different content", () => {
    const hash1 = computeHash("content 1");
    const hash2 = computeHash("content 2");
    expect(hash1).not.toBe(hash2);
  });

  it("should produce 64 character hex string", () => {
    const hash = computeHash("test");
    expect(hash).toHaveLength(64);
    expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
  });
});

describe("Frontmatter Parser", () => {
  it("should parse frontmatter from note", () => {
    const content = `---
title: Test Note
topics:
  - Alpha
  - Beta
---
# Content here`;
    
    const parsed = parseNoteFrontmatter(content);
    expect(parsed.frontmatter.title).toBe("Test Note");
    expect(parsed.frontmatter.topics).toEqual(["Alpha", "Beta"]);
    expect(parsed.body).toBe("# Content here");
  });

  it("should handle notes without frontmatter", () => {
    const content = "# Just content\nNo frontmatter here";
    const parsed = parseNoteFrontmatter(content);
    expect(parsed.frontmatter.title).toBeUndefined();
    expect(parsed.body).toBe(content);
  });

  it("should serialize frontmatter", () => {
    const frontmatter = {
      title: "Test Note",
      topics: ["Alpha"],
    };
    const serialized = serializeNoteFrontmatter("Content here", frontmatter);
    expect(serialized).toContain("---");
    expect(serialized).toContain("title: Test Note");
    expect(serialized).toContain("Content here");
  });
});

describe("Title Extraction", () => {
  it("should extract title from first heading", () => {
    const content = "# My Title\n\nSome content";
    const title = extractTitleFromContent(content);
    expect(title).toBe("My Title");
  });

  it("should use filename if no heading found", () => {
    const content = "Just content\nNo heading";
    const title = extractTitleFromContent(content, "myfile.md");
    expect(title).toBe("myfile");
  });

  it("should return Untitled if no title and no filename", () => {
    const content = "Just content\nNo heading";
    const title = extractTitleFromContent(content);
    expect(title).toBe("Untitled");
  });
});