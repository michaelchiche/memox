import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { findConfigFile, getActiveConfigPath, getGlobalConfigPath, loadConfig, setConfigValue } from "../lib/config.js";

describe("Config file discovery", () => {
  const originalCwd = process.cwd();
  const testDir = path.join(os.tmpdir(), "memo-config-test-" + Date.now());
  const homeDir = path.join(testDir, "home");
  const projectDir = path.join(testDir, "project");
  const nestedDir = path.join(projectDir, "nested");
  
  beforeEach(() => {
    // Create test directories
    fs.mkdirSync(homeDir, { recursive: true });
    fs.mkdirSync(nestedDir, { recursive: true });
  });
  
  afterEach(() => {
    // Clean up test directories
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    process.chdir(originalCwd);
    
    // Clear environment variables
    delete process.env.MEMO_CONFIG_PATH;
    delete process.env.MEMO_STORE_PATH;
    delete process.env.MEMO_LLM_MODEL;
  });
  
  describe("findConfigFile", () => {
    it("should return MEMO_CONFIG_PATH if set", () => {
      const customPath = path.join(testDir, "custom-config.yaml");
      fs.writeFileSync(customPath, "storePath: /custom");
      
      process.env.MEMO_CONFIG_PATH = customPath;
      
      const found = findConfigFile();
      expect(found).toBe(customPath);
    });
    
    it("should find .memorc.yaml in current directory", () => {
      const configPath = path.join(nestedDir, ".memorc.yaml");
      fs.writeFileSync(configPath, "storePath: /nested");
      
      process.chdir(nestedDir);
      
      const found = findConfigFile();
      // Use realpathSync for macOS symlink compatibility
      expect(found && fs.realpathSync(found)).toBe(fs.realpathSync(configPath));
    });
    
    it("should find memo.yaml if .memorc.yaml doesn't exist", () => {
      const configPath = path.join(nestedDir, "memo.yaml");
      fs.writeFileSync(configPath, "storePath: /visible");
      
      process.chdir(nestedDir);
      
      const found = findConfigFile();
      expect(found && fs.realpathSync(found)).toBe(fs.realpathSync(configPath));
    });
    
    it("should prefer .memorc.yaml over memo.yaml", () => {
      const hiddenPath = path.join(nestedDir, ".memorc.yaml");
      const visiblePath = path.join(nestedDir, "memo.yaml");
      
      fs.writeFileSync(hiddenPath, "storePath: /hidden");
      fs.writeFileSync(visiblePath, "storePath: /visible");
      
      process.chdir(nestedDir);
      
      const found = findConfigFile();
      expect(found && fs.realpathSync(found)).toBe(fs.realpathSync(hiddenPath));
    });
    
    it("should walk up directories to find config", () => {
      const projectConfig = path.join(projectDir, ".memorc.yaml");
      fs.writeFileSync(projectConfig, "storePath: /project");
      
      process.chdir(nestedDir);
      
      const found = findConfigFile();
      // Use realpath to resolve symlinks
      expect(found && fs.realpathSync(found)).toBe(fs.realpathSync(projectConfig));
    });
    
    it("should stop at home directory", () => {
      // Create home config
      const homeConfig = path.join(homeDir, ".memorc.yaml");
      fs.writeFileSync(homeConfig, "storePath: /home");
      
      process.chdir(nestedDir);
      
      // Mock os.homedir to return our test home
      const originalHomedir = os.homedir;
      (os as unknown as Record<string, unknown>).homedir = () => homeDir;
      
      const found = findConfigFile();
      
      (os as unknown as Record<string, unknown>).homedir = originalHomedir;
      
      // Use realpath to resolve symlinks
      expect(found && fs.realpathSync(found)).toBe(fs.realpathSync(homeConfig));
    });
    
    it("should return null if no config found", () => {
      process.chdir(nestedDir);
      
      // Mock os.homedir to return a temp directory without config
      const originalHomedir = os.homedir;
      const tempHome = path.join(testDir, "no-config-home");
      fs.mkdirSync(tempHome, { recursive: true });
      (os as unknown as Record<string, unknown>).homedir = () => tempHome;
      
      const found = findConfigFile();
      
      (os as unknown as Record<string, unknown>).homedir = originalHomedir;
      
      expect(found).toBeNull();
    });
  });
  
  describe("getActiveConfigPath", () => {
    it("should return found config file", () => {
      const configPath = path.join(nestedDir, ".memorc.yaml");
      fs.writeFileSync(configPath, "storePath: /test");
      
      process.chdir(nestedDir);
      
      const active = getActiveConfigPath();
      // Use realpath to resolve symlinks (macOS /var -> /private/var)
      expect(fs.realpathSync(active)).toBe(fs.realpathSync(configPath));
    });
    
    it("should return home directory path if no config found", () => {
      process.chdir(nestedDir);
      
      const active = getActiveConfigPath();
      expect(path.basename(active)).toBe(".memorc.yaml");
    });
  });
  
  describe("getGlobalConfigPath", () => {
    it("should always return home directory path", () => {
      const global = getGlobalConfigPath();
      expect(global).toBe(path.join(os.homedir(), ".memorc.yaml"));
    });
  });
  
  describe("loadConfig", () => {
    it("should use environment variables as highest priority", () => {
      const configPath = path.join(nestedDir, ".memorc.yaml");
      fs.writeFileSync(configPath, "storePath: /file\nllm:\n  model: file-model");
      
      process.chdir(nestedDir);
      process.env.MEMO_STORE_PATH = "/env";
      process.env.MEMO_LLM_MODEL = "env-model";
      
      const config = loadConfig();
      
      expect(config.storePath).toBe("/env");
      expect(config.llm.model).toBe("env-model");
    });
    
    it("should use file config when env vars not set", () => {
      const configPath = path.join(nestedDir, ".memorc.yaml");
      fs.writeFileSync(configPath, "storePath: /file\nllm:\n  model: file-model");
      
      process.chdir(nestedDir);
      
      const config = loadConfig();
      
      expect(config.storePath).toBe("/file");
      expect(config.llm.model).toBe("file-model");
    });
    
    it("should use defaults when no config exists", () => {
      process.chdir(nestedDir);
      
      const config = loadConfig();
      
      expect(config.storePath).toContain("memo");
      expect(config.llm.provider).toBe("ollama");
    });
  });
  
  describe("setConfigValue", () => {
    it("should save to local config by default", () => {
      const configPath = path.join(nestedDir, ".memorc.yaml");
      fs.writeFileSync(configPath, "storePath: /test");
      
      process.chdir(nestedDir);
      
      setConfigValue("llm.model", "new-model", false);
      
      const saved = fs.readFileSync(configPath, "utf-8");
      expect(saved).toContain("model: new-model");
    });
    
    it("should save to global config with global flag", () => {
      process.chdir(nestedDir);
      
      const result = setConfigValue("llm.model", "global-model", true);
      
      expect(path.basename(result.path)).toBe(".memorc.yaml");
    });
  });
});