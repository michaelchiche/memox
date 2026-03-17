## 1. Project Setup

- [x] 1.1 Initialize TypeScript/Node.js project with package.json
- [x] 1.2 Configure TypeScript (tsconfig.json)
- [x] 1.3 Set up build tooling (tsup or similar for CLI build)
- [x] 1.4 Add core dependencies (better-sqlite3, gray-matter, commander, prompts)
- [x] 1.5 Create project structure (src/, src/commands, src/lib, src/providers)

## 2. Storage Layer

- [x] 2.1 Create database initialization module with SQLite schema
- [x] 2.2 Implement notes table with indexes
- [x] 2.3 Implement topics table with indexes
- [x] 2.4 Implement note_topics junction table
- [x] 2.5 Implement topic_summaries table
- [x] 2.6 Create FTS5 virtual table for notes content
- [x] 2.7 Implement database path configuration (default ~/memo/)
- [x] 2.8 Create hash utility for file change detection (SHA-256)

## 3. Note Management Core

- [x] 3.1 Create Note type/interface
- [x] 3.2 Implement frontmatter YAML parser
- [x] 3.3 Implement frontmatter YAML writer
- [x] 3.4 Implement note import from single file
- [x] 3.5 Implement note import from directory (glob)
- [x] 3.6 Implement note content storage in DB
- [x] 3.7 Implement hash computation and storage
- [x] 3.8 Implement bidirectional sync logic
- [x] 3.9 Implement conflict detection (hash mismatch)
- [x] 3.10 Implement conflict resolution prompt

## 4. Topic Management Core

- [x] 4.1 Create Topic type/interface
- [x] 4.2 Implement topic CRUD operations
- [x] 4.3 Implement note-topic association (N:N)
- [x] 4.4 Implement topic listing with note count
- [x] 4.5 Implement topic rename (cascade to frontmatter)
- [x] 4.6 Implement topic delete (cascade to frontmatter)
- [x] 4.7 Implement "Non classée" default topic
- [x] 4.8 Implement summary version storage
- [x] 4.9 Implement summary history retrieval

## 5. File Operations

- [x] 5.1 Implement file storage operations (read/write)
- [x] 5.2 Implement configurable storage path
- [x] 5.3 Implement file path resolution
- [x] 5.4 Ensure frontmatter updates preserve file formatting

## 6. LLM Integration

- [x] 6.1 Create LLMProvider interface
- [x] 6.2 Implement OllamaProvider with API client
- [x] 6.3 Implement note classification prompt and response parsing
- [x] 6.4 Implement topic summary generation prompt
- [x] 6.5 Implement topic proposal prompt
- [x] 6.6 Add graceful degradation when LLM unavailable
- [x] 6.7 Implement context window management for large notes
- [x] 6.8 Test Ollama connection detection

## 7. CLI Interface

- [x] 7.1 Set up commander.js CLI framework
- [x] 7.2 Implement `memo --help` command
- [x] 7.3 Implement `memo import <path>` command
- [x] 7.4 Implement `memo note show <file>` command
- [x] 7.5 Implement `memo note add <file>` command
- [x] 7.6 Implement `memo note topics <file>` command
- [x] 7.7 Implement `memo topic list` command
- [x] 7.8 Implement `memo topic show <name>` command
- [x] 7.9 Implement `memo topic create <name>` command
- [x] 7.10 Implement `memo topic rename <old> <new>` command
- [x] 7.11 Implement `memo topic delete <name>` command
- [x] 7.12 Implement `memo topic summarize <name>` command
- [x] 7.13 Implement `memo topic history <name>` command
- [x] 7.14 Implement `memo topic propose` command
- [x] 7.15 Implement `memo sync` command
- [x] 7.16 Implement `memo config` command
- [x] 7.17 Implement `memo config set <key> <value>` command

## 8. Interactive Prompt System

- [x] 8.1 Set up interactive prompt library (prompts/enquirer)
- [x] 8.2 Implement topic selection prompt during import
- [x] 8.3 Implement multi-select for multiple topics
- [x] 8.4 Implement custom topic name input
- [x] 8.5 Implement conflict resolution prompt
- [x] 8.6 Add skip option for notes during import

## 9. Output Formatting

- [x] 9.1 Format topic list as table
- [x] 9.2 Format note display with topics
- [x] 9.3 Format summary history view
- [x] 9.4 Add colors for readability (chalk)
- [x] 9.5 Format error messages clearly

## 10. Configuration

- [x] 10.1 Create config file support (~/.memorc or memo.config.yaml)
- [x] 10.2 Implement config read/write
- [x] 10.3 Support environment variables for config
- [x] 10.4 Document configuration options
- [x] 13.1 Create README with installation instructions
- [x] 13.2 Document all CLI commands with examples
- [x] 13.3 Document configuration options
- [x] 13.4 Add inline code documentation

## 14. Distribution

- [x] 14.1 Configure package.json for CLI installation
- [x] 14.2 Test global installation via npm
- [x] 14.3 Add bin entry for `memo` command
- [x] 14.4 Create release script