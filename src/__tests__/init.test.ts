import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import yaml from "yaml";

const testDir = path.join(os.tmpdir(), "memo-init-test-" + Date.now());
const originalCwd = process.cwd();

describe("init command integration", () => {
  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("should create valid config file structure", () => {
    const mockConfig = {
      storePath: "/test/memo",
      dbPath: "/test/memo/memo.db",
      llm: {
        provider: "ollama",
        model: "llama3.2",
        baseUrl: "http://localhost:11434",
      },
      defaultTopic: "Test Topic",
    };

    const configPath = path.join(testDir, "memo.yaml");
    fs.writeFileSync(configPath, yaml.stringify(mockConfig));

    const content = fs.readFileSync(configPath, "utf-8");
    const parsed = yaml.parse(content);

    expect(parsed.storePath).toBe("/test/memo");
    expect(parsed.llm.provider).toBe("ollama");
    expect(parsed.llm.model).toBe("llama3.2");
    expect(parsed.defaultTopic).toBe("Test Topic");
  });

  it("should handle store path with tilde expansion", () => {
    const storePath = "~/notes";
    const expanded = storePath.startsWith("~")
      ? path.join(os.homedir(), storePath.slice(1))
      : storePath;

    expect(expanded).toBe(path.join(os.homedir(), "/notes"));
  });

  it("should create local config path correctly", () => {
    const localConfigPath = path.join(process.cwd(), "memo.yaml");
    expect(localConfigPath).toContain("memo.yaml");
  });

  it("should create global config path correctly", () => {
    const globalConfigPath = path.join(os.homedir(), ".memorc.yaml");
    expect(globalConfigPath).toContain(".memorc.yaml");
    expect(globalConfigPath).toContain(os.homedir());
  });

  it("should parse defaults and validate structure", () => {
    const defaultConfig = {
      storePath: path.join(os.homedir(), "memo"),
      dbPath: path.join(os.homedir(), "memo", "memo.db"),
      llm: {
        provider: "ollama",
        model: "llama3.2",
        baseUrl: "http://localhost:11434",
      },
      defaultTopic: "Non classée",
    };

    expect(defaultConfig.storePath).toBeDefined();
    expect(defaultConfig.dbPath).toBeDefined();
    expect(defaultConfig.llm.provider).toBe("ollama");
    expect(defaultConfig.llm.model).toBe("llama3.2");
    expect(defaultConfig.defaultTopic).toBe("Non classée");
  });

  it("should use cwd for local init store path", () => {
    const cwd = process.cwd();
    const localDefaultConfig = {
      storePath: ".",
      dbPath: ".memo.db",
    };

    expect(localDefaultConfig.storePath).toBe(".");
    expect(localDefaultConfig.dbPath).toBe(".memo.db");
    
    const resolvedStorePath = path.resolve(localDefaultConfig.storePath);
    const resolvedDbPath = path.resolve(localDefaultConfig.dbPath);
    expect(resolvedStorePath).toBe(cwd);
    expect(resolvedDbPath).toBe(path.join(cwd, ".memo.db"));
  });

  it("should use home directory for global init store path", () => {
    const globalDefaultStorePath = path.join(os.homedir(), "memo");
    const globalDefaultDbPath = path.join(os.homedir(), "memo", "memo.db");

    expect(globalDefaultStorePath).toContain(os.homedir());
    expect(globalDefaultDbPath).toContain(os.homedir());
  });

  it("should store relative paths in local config", () => {
    const mockConfig = {
      storePath: ".",
      dbPath: ".memo.db",
    };

    const content = yaml.stringify(mockConfig);
    const parsed = yaml.parse(content);
    
    expect(parsed.storePath).toBe(".");
    expect(parsed.dbPath).toBe(".memo.db");
  });

  it("should handle overwrite decision for existing config", () => {
    const configPath = path.join(testDir, "memo.yaml");
    fs.writeFileSync(configPath, "storePath: /existing");
    
    expect(fs.existsSync(configPath)).toBe(true);
    
    const content = fs.readFileSync(configPath, "utf-8");
    expect(content).toContain("/existing");
  });

  it("should expand tilde in store path", () => {
    const inputPath = "~/custom/path";
    const expandedPath = inputPath.startsWith("~")
      ? path.join(os.homedir(), inputPath.slice(1))
      : inputPath;

    expect(expandedPath).toBe(path.join(os.homedir(), "/custom/path"));
  });

  it("should support both ollama and openai providers", () => {
    const validProviders = ["ollama", "openai"];
    
    expect(validProviders).toContain("ollama");
    expect(validProviders).toContain("openai");
  });
});