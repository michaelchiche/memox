import fs from "fs";
import path from "path";
import os from "os";
import yaml from "yaml";
import type { Config } from "../types/index.js";

const CONFIG_FILE_HIDDEN = ".memorc.yaml";
const CONFIG_FILE_VISIBLE = "memo.yaml";
const DEFAULT_STORE_PATH = path.join(os.homedir(), "memo");
const DEFAULT_DB_NAME = "memo.db";

/**
 * Get the default configuration.
 */
export function getDefaultConfig(): Config {
  return {
    storePath: DEFAULT_STORE_PATH,
    dbPath: path.join(DEFAULT_STORE_PATH, DEFAULT_DB_NAME),
    llm: {
      provider: "ollama",
      model: "llama3.2",
      baseUrl: "http://localhost:11434",
    },
    defaultTopic: "Non classée",
  };
}

/**
 * Find the config file by walking up from cwd to home directory.
 * Priority: MEMO_CONFIG_PATH env > .memorc.yaml > memo.yaml > ~/.memorc.yaml
 */
export function findConfigFile(): string | null {
  // 1. Explicit override via environment variable
  if (process.env.MEMO_CONFIG_PATH) {
    return process.env.MEMO_CONFIG_PATH;
  }
  
  // 2. Walk up from current directory to home
  let dir = process.cwd();
  const home = os.homedir();
  
  while (true) {
    // Priority: .memorc.yaml (hidden) then memo.yaml (visible)
    const hidden = path.join(dir, CONFIG_FILE_HIDDEN);
    if (fs.existsSync(hidden)) {
      return hidden;
    }
    
    const visible = path.join(dir, CONFIG_FILE_VISIBLE);
    if (fs.existsSync(visible)) {
      return visible;
    }
    
    // Stop at home directory
    if (dir === home) {
      break;
    }
    
    // Stop at filesystem root
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    
    dir = parent;
  }
  
  // 3. Fallback to home directory
  const defaultPath = path.join(home, CONFIG_FILE_HIDDEN);
  if (fs.existsSync(defaultPath)) {
    return defaultPath;
  }
  
  return null;
}

/**
 * Get the active config file path.
 * This is where config will be written when using --global or when no local config exists.
 */
export function getActiveConfigPath(): string {
  const found = findConfigFile();
  if (found) {
    return found;
  }
  // No config found, use home directory as default
  return path.join(os.homedir(), CONFIG_FILE_HIDDEN);
}

/**
 * Get the global config path (~/.memorc.yaml).
 */
export function getGlobalConfigPath(): string {
  return path.join(os.homedir(), CONFIG_FILE_HIDDEN);
}

/**
 * Load configuration with priority: env vars > file config > defaults.
 */
export function loadConfig(): Config {
  const defaultConfig = getDefaultConfig();
  const configPath = findConfigFile();
  
  // Load file config if exists
  let fileConfig: Partial<Config> = {};
  if (configPath && fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, "utf-8");
      fileConfig = yaml.parse(content) || {};
    } catch (error) {
      console.error(`Failed to load config from ${configPath}:`, error);
    }
  }
  
  // Merge with priority: env > file > defaults
  return {
    storePath: 
      process.env.MEMO_STORE_PATH || 
      fileConfig.storePath || 
      defaultConfig.storePath,
    dbPath: 
      process.env.MEMO_DB_PATH || 
      fileConfig.dbPath || 
      defaultConfig.dbPath,
    llm: {
      provider: fileConfig.llm?.provider || defaultConfig.llm.provider,
      model: process.env.MEMO_LLM_MODEL || fileConfig.llm?.model || defaultConfig.llm.model,
      baseUrl: fileConfig.llm?.baseUrl || defaultConfig.llm.baseUrl,
      apiKey: fileConfig.llm?.apiKey,
    },
    defaultTopic: fileConfig.defaultTopic || defaultConfig.defaultTopic,
  };
}

/**
 * Save configuration to a specific file.
 */
export function saveConfigToFile(config: Config, filePath: string): void {
  const configObj = {
    storePath: config.storePath,
    dbPath: config.dbPath,
    llm: {
      provider: config.llm.provider,
      model: config.llm.model,
      baseUrl: config.llm.baseUrl,
      ...(config.llm.apiKey ? { apiKey: config.llm.apiKey } : {}),
    },
    defaultTopic: config.defaultTopic,
  };
  
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const content = yaml.stringify(configObj);
  fs.writeFileSync(filePath, content, "utf-8");
}

/**
 * Save configuration to the active config file.
 */
export function saveConfig(config: Config): void {
  const configPath = getActiveConfigPath();
  saveConfigToFile(config, configPath);
}

/**
 * Set a config value and save to the specified location.
 * @param key - Config key (e.g., "llm.model", "storePath")
 * @param value - Value to set
 * @param global - If true, save to ~/.memorc.yaml; otherwise save to active config
 */
export function setConfigValue(key: string, value: string | number | boolean, global: boolean = false): { config: Config; path: string } {
  const config = loadConfig();
  
  if (key.startsWith("llm.")) {
    const llmKey = key.split(".")[1] as keyof typeof config.llm;
    if (llmKey in config.llm) {
      (config.llm as Record<string, unknown>)[llmKey] = value;
    }
  } else if (key in config) {
    (config as Record<string, unknown>)[key] = value;
  }
  
  const targetPath = global 
    ? getGlobalConfigPath() 
    : getActiveConfigPath();
  
  saveConfigToFile(config, targetPath);
  
  return { config, path: targetPath };
}

/**
 * Ensure the store path directory exists.
 */
export function ensureStorePath(config: Config): void {
  if (!fs.existsSync(config.storePath)) {
    fs.mkdirSync(config.storePath, { recursive: true });
  }
}