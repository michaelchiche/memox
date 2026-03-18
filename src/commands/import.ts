import path from "path";
import chalk from "chalk";
import * as p from "@clack/prompts";
import { intro, outro, spinner } from "@clack/prompts";
import { loadConfig, ensureStorePath } from "../lib/config.js";
import { importNoteFromPath } from "../lib/files.js";
import { getAllTopics, getOrCreateDefaultTopic, createTopic, getTopicByName } from "../lib/topics.js";
import { setNoteTopics } from "../lib/associations.js";
import { OllamaProvider } from "../providers/ollama.js";
import type { LLMProvider } from "../providers/types.js";
import { createGeneration } from "../lib/generations.js";
import { setGeneratedByFrontmatter } from "../lib/frontmatter.js";
import { globSync } from "glob";
import { summarizeNote } from "../lib/summaries.js";

type ImportStep = 
  | "discovering"
  | "reading"
  | "parsing"
  | "hashing"
  | "summarizing"
  | "classifying"
  | "finalizing"
  | "done";

type FileStatus = "pending" | "in-progress" | "completed" | "failed";

interface FileProgress {
  path: string;
  status: FileStatus;
  step?: ImportStep;
  error?: string;
}

interface ImportStats {
  imported: number;
  failed: number;
  skipped: number;
}

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
  
  const stats = await importNotes(absolutePath, config.storePath, provider, options, config, llmAvailable);
  
  let summaryMsg = chalk.green(`Imported ${stats.imported} notes`);
  if (stats.failed > 0) {
    summaryMsg += chalk.red(`, ${stats.failed} failed`);
  }
  if (stats.skipped > 0) {
    summaryMsg += chalk.gray(`, ${stats.skipped} skipped`);
  }
  outro(summaryMsg);
}

function getTotalSteps(
  isTxtFile: boolean,
  llmAvailable: boolean,
  mode: 'auto' | 'default' | 'interactive'
): number {
  if (mode === 'auto') return 1;
  
  let steps = 2; // reading + finalizing
  
  if (isTxtFile && llmAvailable) {
    steps += 1; // summarizing
  }
  
  if (mode === 'interactive' && llmAvailable) {
    steps += 1; // classifying
  }
  
  return steps;
}

function getStepMessage(
  step: ImportStep,
  filename: string,
  currentStep?: number,
  totalSteps?: number
): string {
  const stepLabels: Record<ImportStep, string> = {
    discovering: "Discovering files...",
    reading: `Reading ${filename}`,
    parsing: `Parsing ${filename}`,
    hashing: `Hashing ${filename}`,
    summarizing: `Summarizing ${filename}`,
    classifying: `Classifying ${filename}`,
    finalizing: `Finalizing ${filename}`,
    done: `Completed ${filename}`,
  };
  
  const label = stepLabels[step];
  
  if (step === 'discovering' || step === 'done') {
    return label;
  }
  
  if (currentStep !== undefined && totalSteps !== undefined) {
    return `${label} (${currentStep}/${totalSteps})`;
  }
  
  return label;
}

async function importNotes(
  importPath: string,
  storePath: string,
  provider: LLMProvider,
  options: ImportOptions,
  config: { storePath: string },
  llmAvailable: boolean
): Promise<ImportStats> {
  const stats: ImportStats = { imported: 0, failed: 0, skipped: 0 };
  const existingTopics = getAllTopics();
  
  const s = spinner();
  s.start("Discovering files...");
  
  const discoveredFiles = globSync(["**/*.md", "**/*.txt"], { cwd: importPath, absolute: true });
  
  if (discoveredFiles.length === 0) {
    s.stop("No files found to import");
    return stats;
  }
  
  const fileProgress: Map<string, FileProgress> = new Map();
  for (const file of discoveredFiles) {
    fileProgress.set(file, { path: file, status: "pending" });
  }
  
  s.message(`Found ${discoveredFiles.length} file${discoveredFiles.length === 1 ? "" : "s"} to import`);
  
  const mode: 'auto' | 'default' | 'interactive' = 
    options.auto ? 'auto' : (options.default ? 'default' : 'interactive');
  
  for (let i = 0; i < discoveredFiles.length; i++) {
    const file = discoveredFiles[i];
    const relativePath = path.relative(importPath, file);
    const currentFile = i + 1;
    const totalFiles = discoveredFiles.length;
    
    const progress = fileProgress.get(file)!;
    progress.status = "in-progress";
    
    try {
      const isTxtFile = file.endsWith('.txt');
      const totalSteps = getTotalSteps(isTxtFile, llmAvailable, mode);
      let stepNum = 0;
      
      if (options.default) {
        stepNum++;
        s.message(getStepMessage("reading", relativePath, stepNum, totalSteps));
        const defaultTopic = getOrCreateDefaultTopic();
        const note = importNoteFromPath(file, storePath);
        
        if (isTxtFile && llmAvailable) {
          stepNum++;
          s.message(getStepMessage("summarizing", relativePath, stepNum, totalSteps));
          try {
            await summarizeNote(note, provider);
          } catch (error) {
            console.error(chalk.yellow(`Warning: Could not generate summary for ${note.title}: ${error}`));
          }
        }
        
        stepNum++;
        s.message(getStepMessage("finalizing", relativePath, stepNum, totalSteps));
        setNoteTopics(note.id, [defaultTopic.id]);
        stats.imported++;
        progress.status = "completed";
        progress.step = "done";
        continue;
      }
      
      if (options.auto) {
        stepNum++;
        s.message(getStepMessage("reading", relativePath, stepNum, totalSteps));
        importNoteFromPath(file, storePath);
        stats.imported++;
        progress.status = "completed";
        progress.step = "done";
        continue;
      }
      
      stepNum++;
      s.message(getStepMessage("reading", relativePath, stepNum, totalSteps));
      const note = importNoteFromPath(file, storePath);
      
      if (!llmAvailable) {
        stepNum++;
        s.message(getStepMessage("finalizing", relativePath, stepNum, totalSteps));
        const defaultTopic = getOrCreateDefaultTopic();
        setNoteTopics(note.id, [defaultTopic.id]);
        stats.imported++;
        progress.status = "completed";
        progress.step = "done";
        continue;
      }
      
      let summaryContent = note.content;
      
      if (isTxtFile) {
        stepNum++;
        s.message(getStepMessage("summarizing", relativePath, stepNum, totalSteps));
        try {
          const summary = await summarizeNote(note, provider);
          summaryContent = summary.content;
        } catch (error) {
          console.error(chalk.yellow(`Warning: Could not generate summary: ${error}`));
        }
      }
      
      stepNum++;
      s.message(getStepMessage("classifying", relativePath, stepNum, totalSteps));
      
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
        
        s.stop();
        
        const selection = await p.select({
          message: `Select topic for: ${note.title} (${currentFile}/${totalFiles})`,
          options: choices,
        });
        
        stepNum++;
        s.start(getStepMessage("finalizing", relativePath, stepNum, totalSteps));
        
        if (selection === "skip") {
          const defaultTopic = getOrCreateDefaultTopic();
          setNoteTopics(note.id, [defaultTopic.id]);
          stats.skipped++;
        } else if (selection === "manual") {
          const topicName = await p.text({
            message: "Enter topic name:",
          });
          if (topicName && typeof topicName === "string") {
            s.start(getStepMessage("finalizing", relativePath, stepNum, totalSteps));
            let topic = getTopicByName(topicName);
            if (!topic) {
              topic = createTopic(topicName);
            }
            setNoteTopics(note.id, [topic.id]);
          }
          stats.imported++;
        } else if (typeof selection === "string") {
          if (selection.startsWith("existing:")) {
            const topicId = selection.substring("existing:".length);
            setNoteTopics(note.id, [topicId]);
          } else if (selection.startsWith("new:")) {
            const topicName = selection.substring("new:".length);
            const topic = createTopic(topicName);
            setNoteTopics(note.id, [topic.id]);
          }
          stats.imported++;
        }
        
        progress.status = "completed";
        progress.step = "done";
        
      } catch (error) {
        console.error(chalk.red(`Error classifying note: ${error}`));
        stepNum++;
        s.message(getStepMessage("finalizing", relativePath, stepNum, totalSteps));
        const defaultTopic = getOrCreateDefaultTopic();
        setNoteTopics(note.id, [defaultTopic.id]);
        stats.imported++;
        progress.status = "completed";
        progress.step = "done";
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      progress.status = "failed";
      progress.error = errorMsg;
      stats.failed++;
      console.error(chalk.red(`Error importing ${relativePath}: ${errorMsg}`));
    }
  }
  
  s.stop(`Processed ${discoveredFiles.length} file${discoveredFiles.length === 1 ? "" : "s"}`);
  
  return stats;
}