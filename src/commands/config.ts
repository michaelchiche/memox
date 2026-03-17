import chalk from "chalk";
import { setConfigValue, loadConfig, findConfigFile, getActiveConfigPath, getGlobalConfigPath } from "../lib/config.js";

interface ConfigOptions {
  set?: string;
  path?: boolean;
  global?: boolean;
}

export async function handleConfig(key?: string, options?: ConfigOptions): Promise<void> {
  // Show active config file path
  if (options?.path) {
    const activePath = getActiveConfigPath();
    const found = findConfigFile();
    
    if (found) {
      console.log(found);
    } else {
      console.log(`${activePath} (not found, using defaults)`);
    }
    return;
  }
  
  // Set a config value
  if (options?.set !== undefined) {
    if (!key) {
      console.error(chalk.red("Please specify a config key"));
      return;
    }
    
    const result = setConfigValue(key, options.set, options.global || false);
    const location = options.global ? "global" : "local";
    console.log(chalk.green(`Set ${key} = ${options.set} (${location}: ${result.path})`));
    return;
  }
  
  // Show specific key or full config
  const config = loadConfig();
  
  if (key) {
    const value = getConfigValue(config, key);
    console.log(`${key}: ${JSON.stringify(value, null, 2)}`);
  } else {
    const activePath = getActiveConfigPath();
    const found = findConfigFile();
    
    console.log(chalk.bold("Current configuration:"));
    if (found) {
      console.log(chalk.gray(`Config file: ${found}`));
    } else {
      console.log(chalk.gray(`Config file: ${activePath} (not found, using defaults)`));
    }
    console.log(`Store path: ${config.storePath}`);
    console.log(`Database path: ${config.dbPath}`);
    console.log(`LLM provider: ${config.llm.provider}`);
    console.log(`LLM model: ${config.llm.model}`);
    if (config.llm.baseUrl) {
      console.log(`LLM base URL: ${config.llm.baseUrl}`);
    }
    console.log(`Default topic: ${config.defaultTopic}`);
  }
}

function getConfigValue(config: ReturnType<typeof loadConfig>, key: string): unknown {
  if (key.startsWith("llm.")) {
    const llmKey = key.split(".")[1] as keyof typeof config.llm;
    return config.llm[llmKey];
  }
  if (key in config) {
    return (config as Record<string, unknown>)[key];
  }
  return undefined;
}