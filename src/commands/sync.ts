import path from "path";
import chalk from "chalk";
import { loadConfig } from "../lib/config.js";
import { syncAllNotes } from "../lib/files.js";
import { note } from "@clack/prompts";

export async function handleSync(): Promise<void> {
  const config = loadConfig();
  
  console.log(chalk.blue("Synchronizing notes"));
  
  const results = syncAllNotes(config.storePath);
  
  const created = results.filter(r => r.status === "created").length;
  const updated = results.filter(r => r.status === "updated").length;
  const unchanged = results.filter(r => r.status === "unchanged").length;
  
  note(`Created: ${created}\nUpdated: ${updated}\nUnchanged: ${unchanged}`, "Sync Results");
  
  console.log(chalk.green("Sync complete"));
}