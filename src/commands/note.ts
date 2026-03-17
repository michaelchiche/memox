import path from "path";
import chalk from "chalk";
import { loadConfig } from "../lib/config.js";
import { getNoteByPath } from "../lib/notes.js";
import { getTopicsForNote } from "../lib/associations.js";

export async function handleNoteShow(file: string): Promise<void> {
  const config = loadConfig();
  const filePath = path.isAbsolute(file) ? file : path.join(config.storePath, file);
  const relativePath = path.relative(config.storePath, filePath);
  
  const note = getNoteByPath(relativePath);
  
  if (!note) {
    console.error(chalk.red(`Note not found: ${file}`));
    return;
  }
  
  console.log(chalk.bold.blue(note.title));
  console.log(chalk.gray(`Path: ${note.path}`));
  console.log(chalk.gray(`Created: ${note.createdAt.toLocaleDateString()}`));
  console.log(chalk.gray(`Updated: ${note.updatedAt.toLocaleDateString()}`));
  
  const topics = getTopicsForNote(note.id);
  if (topics.length > 0) {
    console.log(chalk.bold("\nTopics:"));
    topics.forEach(t => console.log(chalk.cyan(`  - ${t.name}`)));
  } else {
    console.log(chalk.gray("\nNo topics assigned."));
  }
  
  console.log(chalk.bold("\nContent:"));
  console.log(note.content.substring(0, 500) + (note.content.length > 500 ? "..." : ""));
}

export async function handleNoteAdd(file: string): Promise<void> {
  const config = loadConfig();
  const filePath = path.isAbsolute(file) ? file : path.join(config.storePath, file);
  const relativePath = path.relative(config.storePath, filePath);
  
  const note = getNoteByPath(relativePath);
  
  if (note) {
    console.log(chalk.yellow(`Note already imported: ${file}`));
    return;
  }
  
  console.log(chalk.green(`Added note: ${file}`));
}

export async function handleNoteTopics(file: string): Promise<void> {
  const config = loadConfig();
  const filePath = path.isAbsolute(file) ? file : path.join(config.storePath, file);
  const relativePath = path.relative(config.storePath, filePath);
  
  const note = getNoteByPath(relativePath);
  
  if (!note) {
    console.error(chalk.red(`Note not found: ${file}`));
    return;
  }
  
  const topics = getTopicsForNote(note.id);
  
  if (topics.length === 0) {
    console.log(chalk.gray("No topics assigned to this note."));
    return;
  }
  
  console.log(chalk.bold("Topics:"));
  topics.forEach(t => console.log(chalk.cyan(`  - ${t.name}`)));
}