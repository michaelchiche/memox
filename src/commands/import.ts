import path from "path";
import chalk from "chalk";
import * as p from "@clack/prompts";
import { intro, outro } from "@clack/prompts";
import { loadConfig, ensureStorePath } from "../lib/config.js";
import { importNoteFromPath } from "../lib/files.js";
import { getAllTopics, getOrCreateDefaultTopic, createTopic, getTopicByName } from "../lib/topics.js";
import { setNoteTopics } from "../lib/associations.js";
import { getNoteByPath } from "../lib/notes.js";
import { OllamaProvider } from "../providers/ollama.js";
import type { LLMProvider } from "../providers/types.js";
import { createGeneration } from "../lib/generations.js";
import { setGeneratedByFrontmatter } from "../lib/frontmatter.js";
import { globSync } from "glob";
import { summarizeNote } from "../lib/summaries.js";

interface ImportOptions {
  auto?: boolean;
  default?: boolean;
}

export async function handleImport(filePath: string, options: ImportOptions): Promise<void> {
  const config = loadConfig();
  ensureStorePath(config);
  
  intro(chalk.blue("Importing notes"));
  
  const provider: LLMProvider = new OllamaProvider(config.llm);
  const llmAvailable = await provider.isAvailable();
  
  if (!llmAvailable) {
    console.log(chalk.yellow("LLM not available. Notes will be imported without topic suggestions."));
  }
  
  let absolutePath = filePath;
  if (!path.isAbsolute(filePath)) {
    absolutePath = path.resolve(process.cwd(), filePath);
  }
  
  const stats = await importNotes(absolutePath, config.storePath, provider, options, config);
  
  outro(chalk.green(`Imported ${stats.imported} notes, skipped ${stats.skipped}`));
}

async function importNotes(
  importPath: string,
  storePath: string,
  provider: LLMProvider,
  options: ImportOptions,
  config: { storePath: string }
): Promise<{ imported: number; skipped: number }> {
  let imported = 0;
  let skipped = 0;
  
  const existingTopics = getAllTopics();
  
  const files = globSync(["**/*.md", "**/*.txt"], { cwd: importPath, absolute: true });
  
  for (const file of files) {
    const relativePath = path.relative(storePath, file);
    const existingNote = getNoteByPath(relativePath);
    const isTxtFile = file.endsWith('.txt');
    
    if (options.default) {
      const defaultTopic = getOrCreateDefaultTopic();
      const note = importNoteFromPath(file, storePath);
      
      if (isTxtFile && (await provider.isAvailable())) {
        try {
          await summarizeNote(note, provider);
        } catch (error) {
          console.error(chalk.yellow(`Warning: Could not generate summary for ${note.title}: ${error}`));
        }
      }
      
      setNoteTopics(note.id, [defaultTopic.id]);
      imported++;
      continue;
    }
    
    if (options.auto) {
      importNoteFromPath(file, storePath);
      imported++;
      continue;
    }
    
    if (!existingTopics.length && !existingNote) {
      const note = importNoteFromPath(file, storePath);
      
      if (isTxtFile && (await provider.isAvailable())) {
        try {
          await summarizeNote(note, provider);
          console.log(chalk.gray(`  Generated summary for: ${note.title}`));
        } catch (error) {
          console.error(chalk.yellow(`Warning: Could not generate summary: ${error}`));
        }
      }
      
      imported++;
      continue;
    }
    
    const note = importNoteFromPath(file, storePath);
    
    if (!(await provider.isAvailable())) {
      const defaultTopic = getOrCreateDefaultTopic();
      setNoteTopics(note.id, [defaultTopic.id]);
      imported++;
      continue;
    }
    
    let summaryContent = note.content;
    
    if (isTxtFile) {
      try {
        const summary = await summarizeNote(note, provider);
        summaryContent = summary.content;
        console.log(chalk.gray(`  Generated summary for: ${note.title}`));
      } catch (error) {
        console.error(chalk.yellow(`Warning: Could not generate summary: ${error}`));
      }
    }
    
    try {
      const noteForClassification = isTxtFile ? { ...note, content: summaryContent } : note;
      const result = await provider.classifyNote(noteForClassification, existingTopics);
      
      createGeneration('note', note.id, result.metadata);
      
      const noteFilePath = path.join(config.storePath, note.path);
      setGeneratedByFrontmatter(noteFilePath, result.metadata);
      
      const choices: Array<{ value: string; label: string }> = [
        ...result.rankedTopics.slice(0, 3).map((t) => ({
          value: `existing:${t.topic.id}`,
          label: `${t.topic.name} (${t.confidence}%)`,
        })),
        ...result.suggestedNewTopics.slice(0, 5).map((t) => ({
          value: `new:${t}`,
          label: `Create: ${t}`,
        })),
        { value: "manual", label: "Enter topic manually" },
        { value: "skip", label: "Skip (assign to default topic)" },
      ];
      
      const selection = await p.select({
        message: `Select topic for: ${note.title}`,
        options: choices,
      });
      
      if (selection === "skip") {
        const defaultTopic = getOrCreateDefaultTopic();
        setNoteTopics(note.id, [defaultTopic.id]);
        skipped++;
      } else if (selection === "manual") {
        const topicName = await p.text({
          message: "Enter topic name:",
        });
        if (topicName && typeof topicName === "string") {
          let topic = getTopicByName(topicName);
          if (!topic) {
            topic = createTopic(topicName);
          }
          setNoteTopics(note.id, [topic.id]);
        }
        imported++;
      } else if (typeof selection === "string") {
        if (selection.startsWith("existing:")) {
          const topicId = selection.substring("existing:".length);
          setNoteTopics(note.id, [topicId]);
        } else if (selection.startsWith("new:")) {
          const topicName = selection.substring("new:".length);
          const topic = createTopic(topicName);
          setNoteTopics(note.id, [topic.id]);
        }
        imported++;
      }
    } catch (error) {
      console.error(chalk.red(`Error classifying note: ${error}`));
      const defaultTopic = getOrCreateDefaultTopic();
      setNoteTopics(note.id, [defaultTopic.id]);
      imported++;
    }
  }
  
  return { imported, skipped };
}