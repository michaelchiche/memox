import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

const CLI_PATH = path.join(__dirname, "../../dist/cli.js");
const TEST_DIR = path.join(os.tmpdir(), "memo-test-" + Date.now());

describe("CLI Integration Tests", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe("help", () => {
    it("should display help", () => {
      const result = execSync(`node ${CLI_PATH} --help`, { encoding: "utf-8" });
      expect(result).toContain("memo");
      expect(result).toContain("import");
      expect(result).toContain("topic");
      expect(result).toContain("sync");
    });
  });

  describe("config", () => {
    it("should display default config", () => {
      const result = execSync(`node ${CLI_PATH} config`, { encoding: "utf-8" });
      expect(result).toContain("Store path");
      expect(result).toContain("LLM provider");
    });
  });

  describe("topic", () => {
    it("should list empty topics", () => {
      const result = execSync(`node ${CLI_PATH} topic list`, {
        encoding: "utf-8",
      });
      expect(
        result.includes("No topics found") || result.includes("Name"),
      ).toBe(true);
    });
  });

  // Note: Full integration tests require Ollama running
  // These are placeholder tests that can be expanded
});
