## 1. Project Setup

- [ ] 1.1 Initialize TypeScript/Node.js project with package.json
- [ ] 1.2 Configure TypeScript (tsconfig.json)
- [ ] 1.3 Set up build tooling (tsup or similar for CLI build)
- [ ] 1.4 Add core dependencies (better-sqlite3, gray-matter, commander, prompts)
- [ ] 1.5 Create project structure (src/, src/commands, src/lib, src/providers)

## 2. Storage Layer

- [ ] 2.1 Create database initialization module with SQLite schema
- [ ] 2.2 Implement notes table with indexes
- [ ] 2.3 Implement topics table with indexes
- [ ] 2.4 Implement note_topics junction table
- [ ] 2.5 Implement topic_summaries table
- [ ] 2.6 Create FTS5 virtual table for notes content
- [ ] 2.7 Implement database path configuration (default ~/memo/)
- [ ] 2.8 Create hash utility for file change detection (SHA-256)

## 3. Note Management Core

- [ ] 3.1 Create Note type/interface
- [ ] 3.2 Implement frontmatter YAML parser
- [ ] 3.3 Implement frontmatter YAML writer
- [ ] 3.4 Implement note import from single file
- [ ] 3.5 Implement note import from directory (glob)
- [ ] 3.6 Implement note content storage in DB
- [ ] 3.7 Implement hash computation and storage
- [ ] 3.8 Implement bidirectional sync logic
- [ ] 3.9 Implement conflict detection (hash mismatch)
- [ ] 3.10 Implement conflict resolution prompt

## 4. Topic Management Core

- [ ] 4.1 Create Topic type/interface
- [ ] 4.2 Implement topic CRUD operations
- [ ] 4.3 Implement note-topic association (N:N)
- [ ] 4.4 Implement topic listing with note count
- [ ] 4.5 Implement topic rename (cascade to frontmatter)
- [ ] 4.6 Implement topic delete (cascade to frontmatter)
- [ ] 4.7 Implement "Non classée" default topic
- [ ] 4.8 Implement summary version storage
- [ ] 4.9 Implement summary history retrieval

## 5. File Operations

- [ ] 5.1 Implement file storage operations (read/write)
- [ ] 5.2 Implement configurable storage path
- [ ] 5.3 Implement file path resolution
- [ ] 5.4 Ensure frontmatter updates preserve file formatting

## 6. LLM Integration

- [ ] 6.1 Create LLMProvider interface
- [ ] 6.2 Implement OllamaProvider with API client
- [ ] 6.3 Implement note classification prompt and response parsing
- [ ] 6.4 Implement topic summary generation prompt
- [ ] 6.5 Implement topic proposal prompt
- [ ] 6.6 Add graceful degradation when LLM unavailable
- [ ] 6.7 Implement context window management for large notes
- [ ] 6.8 Test Ollama connection detection

## 7. CLI Interface

- [ ] 7.1 Set up commander.js CLI framework
- [ ] 7.2 Implement `memo --help` command
- [ ] 7.3 Implement `memo import <path>` command
- [ ] 7.4 Implement `memo note show <file>` command
- [ ] 7.5 Implement `memo note add <file>` command
- [ ] 7.6 Implement `memo note topics <file>` command
- [ ] 7.7 Implement `memo topic list` command
- [ ] 7.8 Implement `memo topic show <name>` command
- [ ] 7.9 Implement `memo topic create <name>` command
- [ ] 7.10 Implement `memo topic rename <old> <new>` command
- [ ] 7.11 Implement `memo topic delete <name>` command
- [ ] 7.12 Implement `memo topic summarize <name>` command
- [ ] 7.13 Implement `memo topic history <name>` command
- [ ] 7.14 Implement `memo topic propose` command
- [ ] 7.15 Implement `memo sync` command
- [ ] 7.16 Implement `memo config` command
- [ ] 7.17 Implement `memo config set <key> <value>` command

## 8. Interactive Prompt System

- [ ] 8.1 Set up interactive prompt library (prompts/enquirer)
- [ ] 8.2 Implement topic selection prompt during import
- [ ] 8.3 Implement multi-select for multiple topics
- [ ] 8.4 Implement custom topic name input
- [ ] 8.5 Implement conflict resolution prompt
- [ ] 8.6 Add skip option for notes during import

## 9. Output Formatting

- [ ] 9.1 Format topic list as table
- [ ] 9.2 Format note display with topics
- [ ] 9.3 Format summary history view
- [ ] 9.4 Add colors for readability (chalk)
- [ ] 9.5 Format error messages clearly

## 10. Configuration

- [ ] 10.1 Create config file support (~/.memorc or memo.config.yaml)
- [ ] 10.2 Implement config read/write
- [ ] 10.3 Support environment variables for config
- [ ] 10.4 Document configuration options

## 11. Error Handling

- [ ] 11.1 Implement user-friendly error messages
- [ ] 11.2 Handle LLM connection errors gracefully
- [ ] 11.3 Handle file system errors
- [ ] 11.4 Handle database errors
- [ ] 11.5 Add validation for user inputs

## 12. Testing

- [ ] 12.1 Set up test framework (Jest or Vitest)
- [ ] 12.2 Add unit tests for storage layer
- [ ] 12.3 Add unit tests for note operations
- [ ] 12.4 Add unit tests for topic operations
- [ ] 12.5 Add unit tests for LLM provider interface
- [ ] 12.6 Add integration tests for CLI commands

## 13. Documentation

- [ ] 13.1 Create README with installation instructions
- [ ] 13.2 Document all CLI commands with examples
- [ ] 13.3 Document configuration options
- [ ] 13.4 Add inline code documentation

## 14. Distribution

- [ ] 14.1 Configure package.json for CLI installation
- [ ] 14.2 Test global installation via npm
- [ ] 14.3 Add bin entry for `memo` command
- [ ] 14.4 Create release script