import chalk from "chalk";
import Table from "cli-table3";
import { loadConfig } from "../lib/config.js";
import { getAllTopics, getTopicByName, createTopic, renameTopic, deleteTopic, getNoteCountForTopic, getLatestSummary, addSummaryVersion, getSummaryHistory } from "../lib/topics.js";
import { getNotesForTopic, getTopicsForNote, removeAllTopicAssociations } from "../lib/associations.js";
import { getNotesWithoutTopics } from "../lib/notes.js";
import { OllamaProvider } from "../providers/ollama.js";
import * as p from "@clack/prompts";
import { updateNoteFileFrontmatter } from "../lib/frontmatter.js";
import path from "path";

export async function handleTopicList(): Promise<void> {
  const topics = getAllTopics();
  
  if (topics.length === 0) {
    console.log(chalk.yellow("No topics found. Create one with `memo topic create <name>`"));
    return;
  }
  
  const table = new Table({
    head: [chalk.bold("Name"), chalk.bold("Notes"), chalk.bold("Updated")],
    colWidths: [30, 10, 20],
  });
  
  for (const topic of topics) {
    const count = getNoteCountForTopic(topic.id);
    table.push([
      topic.name,
      count.toString(),
      topic.updatedAt.toLocaleDateString(),
    ]);
  }
  
  console.log(table.toString());
}

export async function handleTopicShow(name: string): Promise<void> {
  const topic = getTopicByName(name);
  
  if (!topic) {
    console.error(chalk.red(`Topic not found: ${name}`));
    return;
  }
  
  console.log(chalk.bold.blue(topic.name));
  if (topic.description) {
    console.log(chalk.gray(topic.description));
  }
  console.log(chalk.gray(`Created: ${topic.createdAt.toLocaleDateString()}`));
  console.log(chalk.gray(`Updated: ${topic.updatedAt.toLocaleDateString()}`));
  
  const summary = getLatestSummary(topic.id);
  
  if (summary) {
    console.log(chalk.bold("\nSummary:"));
    console.log(summary.content);
  }
  
  const notes = getNotesForTopic(topic.id);
  console.log(chalk.bold(`\nNotes (${notes.length}):`));
  notes.forEach(n => console.log(chalk.cyan(`  - ${n.title}`)));
}

export async function handleTopicCreate(name: string, options?: { description?: string }): Promise<void> {
  const existing = getTopicByName(name);
  
  if (existing) {
    console.error(chalk.red(`Topic already exists: ${name}`));
    return;
  }
  
  const topic = createTopic(name, options?.description);
  console.log(chalk.green(`Created topic: ${topic.name}`));
}

export async function handleTopicRename(oldName: string, newName: string): Promise<void> {
  const topic = getTopicByName(oldName);
  
  if (!topic) {
    console.error(chalk.red(`Topic not found: ${oldName}`));
    return;
  }
  
  const existing = getTopicByName(newName);
  if (existing) {
    console.error(chalk.red(`Topic already exists: ${newName}`));
    return;
  }
  
  const updated = renameTopic(oldName, newName);
  console.log(chalk.green(`Renamed topic: ${oldName} -> ${newName}`));
}

export async function handleTopicDelete(name: string): Promise<void> {
  const topic = getTopicByName(name);
  
  if (!topic) {
    console.error(chalk.red(`Topic not found: ${name}`));
    return;
  }
  
  const config = loadConfig();
  const notes = getNotesForTopic(topic.id);
  
  for (const note of notes) {
    const noteTopics = getTopicsForNote(note.id);
    const remainingTopics = noteTopics.filter(t => t.id !== topic.id).map(t => t.name);
    const filePath = path.join(config.storePath, note.path);
    updateNoteFileFrontmatter(filePath, remainingTopics);
  }
  
  removeAllTopicAssociations(topic.id);
  deleteTopic(topic.id);
  
  console.log(chalk.green(`Deleted topic: ${name}`));
}

export async function handleTopicSummarize(name: string): Promise<void> {
  const config = loadConfig();
  const topic = getTopicByName(name);
  
  if (!topic) {
    console.error(chalk.red(`Topic not found: ${name}`));
    return;
  }
  
  console.log(chalk.blue(`Generating summary for: ${name}`));
  
  const provider = new OllamaProvider(config.llm);
  
  if (!(await provider.isAvailable())) {
    console.error(chalk.red("LLM not available. Cannot generate summary."));
    return;
  }
  
  const notes = getNotesForTopic(topic.id);
  
  if (notes.length === 0) {
    console.log(chalk.yellow("No notes in this topic. Cannot generate summary."));
    return;
  }
  
  const summary = await provider.summarizeTopic(topic, notes);
  
  addSummaryVersion(topic.id, summary);
  
  console.log(chalk.green("Summary generated"));
  console.log("\n" + chalk.bold("Summary:"));
  console.log(summary);
}

export async function handleTopicHistory(name: string): Promise<void> {
  const topic = getTopicByName(name);
  
  if (!topic) {
    console.error(chalk.red(`Topic not found: ${name}`));
    return;
  }
  
  const history = getSummaryHistory(topic.id);
  
  if (history.length === 0) {
    console.log(chalk.yellow("No summaries found for this topic."));
    return;
  }
  
  console.log(chalk.bold(`Summary history for: ${name}\n`));
  
  history.forEach((s) => {
    console.log(chalk.bold(`Version ${s.version} - ${s.generatedAt.toLocaleDateString()}`));
    console.log(s.content.substring(0, 200) + "...");
    console.log();
  });
}

export async function handleTopicPropose(): Promise<void> {
  const config = loadConfig();
  
  console.log(chalk.blue("Proposing topics from unorganized notes"));
  
  const provider = new OllamaProvider(config.llm);
  
  if (!(await provider.isAvailable())) {
    console.error(chalk.red("LLM not available. Cannot propose topics."));
    return;
  }
  
  const notes = getNotesWithoutTopics();
  
  if (notes.length === 0) {
    console.log(chalk.yellow("All notes are already organized into topics."));
    return;
  }
  
  const proposals = await provider.proposeTopics(notes);
  
  if (proposals.length === 0) {
    console.log(chalk.yellow("Could not generate topic proposals."));
    return;
  }
  
  console.log(chalk.bold("\nProposed topics:\n"));
  
  proposals.forEach((p, i) => {
    console.log(chalk.bold(`${i + 1}. ${p.name}`));
    console.log(chalk.gray(`   ${p.description}`));
    if (p.sampleNotes.length > 0) {
      console.log(chalk.cyan(`   Sample notes: ${p.sampleNotes.slice(0, 3).join(", ")}`));
    }
    console.log();
  });
  
  const createInput = await p.input({
    message: "Create topics? Enter comma-separated numbers (or 'all' or 'none'):",
  });
  
  if (createInput === "none") {
    console.log("No topics created.");
    return;
  }
  
  let toCreate: string[];
  if (createInput === "all") {
    toCreate = proposals.map(p => p.name);
  } else {
    toCreate = createInput
      .split(",")
      .map(s => s.trim())
      .filter((s): s is string => {
        const idx = parseInt(s) - 1;
        return !isNaN(idx) && idx >= 0 && idx < proposals.length;
      })
      .map((s) => {
        const idx = parseInt(s) - 1;
        return proposals[idx].name;
      });
  }
  
  for (const name of toCreate) {
    if (!getTopicByName(name)) {
      createTopic(name);
    }
  }
  
  console.log(chalk.green(`Created ${toCreate.length} topics`));
}