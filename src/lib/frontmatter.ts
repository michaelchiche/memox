import matter from "gray-matter";
import yaml from "yaml";
import type { NoteFrontmatter } from "../types/index.js";

export interface ParsedNote {
  frontmatter: NoteFrontmatter;
  content: string;
  body: string;
}

export function parseNoteFrontmatter(fileContent: string): ParsedNote {
  const parsed = matter(fileContent);
  
  const frontmatter: NoteFrontmatter = {
    title: parsed.data.title,
    topics: parsed.data.topics || [],
    created: parsed.data.created,
    updated: parsed.data.updated,
  };
  
  return {
    frontmatter,
    content: fileContent,
    body: parsed.content.trim(),
  };
}

export function serializeNoteFrontmatter(
  body: string,
  frontmatter: NoteFrontmatter
): string {
  const data: Record<string, unknown> = {};
  
  if (frontmatter.title) {
    data.title = frontmatter.title;
  }
  if (frontmatter.topics && frontmatter.topics.length > 0) {
    data.topics = frontmatter.topics;
  }
  if (frontmatter.created) {
    data.created = frontmatter.created;
  }
  if (frontmatter.updated) {
    data.updated = frontmatter.updated;
  }
  
  if (Object.keys(data).length === 0) {
    return body;
  }
  
  const frontmatterYaml = yaml.stringify(data).trim();
  return `---\n${frontmatterYaml}\n---\n${body}`;
}

export function extractTitleFromContent(content: string, filename?: string): string {
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^#\s+(.+)$/);
    if (match) {
      return match[1].trim();
    }
  }
  if (filename) {
    return filename.replace(/\.md$/, "");
  }
  return "Untitled";
}

export function updateNoteFileFrontmatter(
  filePath: string,
  topics: string[]
): void {
  const fs = require("fs");
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = parseNoteFrontmatter(content);
  const now = new Date().toISOString();
  
  const frontmatter: NoteFrontmatter = {
    ...parsed.frontmatter,
    topics,
    updated: now,
  };
  
  const updated = serializeNoteFrontmatter(parsed.body, frontmatter);
  fs.writeFileSync(filePath, updated, "utf-8");
}