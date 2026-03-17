import { Command } from "commander";
import { handleImport } from "./import.js";
import { handleSync } from "./sync.js";
import { handleConfig } from "./config.js";
import { handleInit } from "./init.js";
import { handleNoteShow, handleNoteAdd, handleNoteTopics } from "./note.js";
import { handleTopicList, handleTopicShow, handleTopicCreate, handleTopicRename, handleTopicDelete, handleTopicSummarize, handleTopicHistory, handleTopicPropose } from "./topic.js";

export function initCommands(program: Command): void {
  program
    .command("init")
    .description("Initialize memo configuration")
    .option("-g, --global", "Create global config (~/.memorc.yaml) instead of local", false)
    .action(handleInit);

  program
    .command("import <path>")
    .description("Import notes from a file or directory")
    .option("-a, --auto", "Auto-accept suggestions without prompts", false)
    .option("-d, --default", "Use default topic for all notes", false)
    .action(handleImport);

  program
    .command("sync")
    .description("Synchronize database with note files")
    .action(handleSync);
  
  program
    .command("config")
    .description("Show current configuration")
    .argument("[key]", "Config key to show")
    .option("-s, --set <value>", "Set config value")
    .option("-p, --path", "Show active config file path")
    .option("-g, --global", "Use global config (~/.memorc.yaml) for set operations")
    .action(handleConfig);
  
  const noteCommand = program
    .command("note")
    .description("Manage notes");
  
  noteCommand
    .command("show <file>")
    .description("Show note details and topics")
    .option("--show-llm", "Show LLM model used for classification")
    .action((file: string, options: { showLlm?: boolean }) => handleNoteShow(file, options));
  
  noteCommand
    .command("add <file>")
    .description("Add a new note to the database")
    .action(handleNoteAdd);
  
  noteCommand
    .command("topics <file>")
    .description("List topics for a note")
    .action(handleNoteTopics);
  
  const topicCommand = program
    .command("topic")
    .description("Manage topics");
  
  topicCommand
    .command("list")
    .description("List all topics")
    .action(handleTopicList);
  
  topicCommand
    .command("show <name>")
    .description("Show topic details and notes")
    .option("--show-llm", "Show LLM model used for summary generation")
    .action((name: string, options: { showLlm?: boolean }) => handleTopicShow(name, options));
  
  topicCommand
    .command("create <name>")
    .description("Create a new topic")
    .option("-d, --description <desc>", "Topic description")
    .action(handleTopicCreate);
  
  topicCommand
    .command("rename <old> <new>")
    .description("Rename a topic")
    .action(handleTopicRename);
  
  topicCommand
    .command("delete <name>")
    .description("Delete a topic")
    .action(handleTopicDelete);
  
  topicCommand
    .command("summarize <name>")
    .description("Generate or regenerate topic summary")
    .action(handleTopicSummarize);
  
  topicCommand
    .command("history <name>")
    .description("Show summary history for a topic")
    .action(handleTopicHistory);
  
  topicCommand
    .command("propose")
    .description("Propose new topics from unorganized notes")
    .action(handleTopicPropose);
}