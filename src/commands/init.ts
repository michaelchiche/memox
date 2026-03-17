import path from "path";
import os from "os";
import fs from "fs";
import chalk from "chalk";
import * as p from "@clack/prompts";
import { intro, outro } from "@clack/prompts";
import { getDefaultConfig, saveConfigToFile } from "../lib/config.js";
import { ensureDirectories, initDatabase } from "../lib/database.js";
import type { Config } from "../types/index.js";

const CONFIG_FILE_LOCAL = "memo.yaml";
const CONFIG_FILE_GLOBAL = ".memorc.yaml";

interface InitOptions {
  global?: boolean;
}

export async function handleInit(options: InitOptions): Promise<void> {
  intro(chalk.blue("Initializing memo"));

  const defaultConfig = getDefaultConfig();
  
  const configPath = options.global
    ? path.join(os.homedir(), CONFIG_FILE_GLOBAL)
    : path.join(process.cwd(), CONFIG_FILE_LOCAL);

  if (fs.existsSync(configPath)) {
    const overwrite = await p.confirm({
      message: `Config file already exists at ${configPath}. Overwrite?`,
      initialValue: false,
    });

    if (!overwrite) {
      outro(chalk.yellow("Init cancelled"));
      return;
    }
  }

  console.log(chalk.bold("\nCurrent defaults:"));
  console.log(`  Store path: ${defaultConfig.storePath}`);
  console.log(`  LLM: ${defaultConfig.llm.provider}/${defaultConfig.llm.model}`);
  console.log(`  Default topic: ${defaultConfig.defaultTopic}`);

  const customize = await p.confirm({
    message: "Customize defaults?",
    initialValue: false,
  });

  let config: Config = { ...defaultConfig };

  if (customize) {
    const storePath = await p.text({
      message: "Store path",
      placeholder: defaultConfig.storePath,
      defaultValue: defaultConfig.storePath,
    });

    if (p.isCancel(storePath)) {
      outro(chalk.yellow("Init cancelled"));
      return;
    }

    const provider = await p.select({
      message: "LLM provider",
      options: [
        { value: "ollama", label: "Ollama (local)" },
        { value: "openai", label: "OpenAI (API)" },
      ],
      initialValue: defaultConfig.llm.provider,
    });

    if (p.isCancel(provider)) {
      outro(chalk.yellow("Init cancelled"));
      return;
    }

    const model = await p.text({
      message: "LLM model",
      placeholder: defaultConfig.llm.model,
      defaultValue: defaultConfig.llm.model,
    });

    if (p.isCancel(model)) {
      outro(chalk.yellow("Init cancelled"));
      return;
    }

    const defaultTopic = await p.text({
      message: "Default topic",
      placeholder: defaultConfig.defaultTopic,
      defaultValue: defaultConfig.defaultTopic,
    });

    if (p.isCancel(defaultTopic)) {
      outro(chalk.yellow("Init cancelled"));
      return;
    }

    const resolvedStorePath = storePath.startsWith("~")
      ? path.join(os.homedir(), storePath.slice(1))
      : storePath;

    config = {
      storePath: resolvedStorePath,
      dbPath: path.join(resolvedStorePath, "memo.db"),
      llm: {
        provider: provider as "ollama" | "openai",
        model: model as string,
        baseUrl: defaultConfig.llm.baseUrl,
      },
      defaultTopic: defaultTopic as string,
    };

    if (provider === "openai") {
      const apiKey = await p.text({
        message: "OpenAI API key",
        placeholder: "sk-...",
      });

      if (p.isCancel(apiKey)) {
        outro(chalk.yellow("Init cancelled"));
        return;
      }

      if (apiKey && typeof apiKey === "string") {
        config.llm.apiKey = apiKey;
      }
    }
  }

  try {
    ensureDirectories(config);
    initDatabase(config.dbPath);
    saveConfigToFile(config, configPath);

    console.log(chalk.green("\n✓ Created config at:"), configPath);
    console.log(chalk.green("✓ Store path:"), config.storePath);
    console.log(chalk.green("✓ Database:"), config.dbPath);
    
    outro(chalk.green("Init complete!\n") + chalk.gray('Run `memo import ./notes/` or `memo sync` to start.'));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`\nInit failed: ${errorMessage}`));
    
    try {
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
    } catch {
      // Ignore cleanup errors
    }
    
    process.exit(1);
  }
}