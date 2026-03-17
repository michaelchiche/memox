import { Command } from "commander";
import { initDatabase, closeDatabase, ensureDirectories } from "./lib/database.js";
import { loadConfig, ensureStorePath, getActiveConfigPath } from "./lib/config.js";
import { initCommands } from "./commands/index.js";

const program = new Command();

program
  .name("memo")
  .description("CLI tool for organizing markdown notes with LLM assistance")
  .version("0.1.0");

initCommands(program);

export async function main(): Promise<void> {
  // Debug mode: show which config file is being used
  if (process.env.MEMO_DEBUG === "1" || process.env.MEMO_DEBUG === "true") {
    const configPath = getActiveConfigPath();
    console.error(`[DEBUG] Using config: ${configPath}`);
  }
  
  try {
    const config = loadConfig();
    ensureStorePath(config);
    ensureDirectories(config);
    initDatabase(config.dbPath);
    
    await program.parseAsync(process.argv);
  } finally {
    closeDatabase();
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});