## Why

Personal notes scattered across markdown files are hard to organize and keep coherent. Traditional tagging systems require manual taxonomy maintenance and don't scale well. This change introduces `memo` - a CLI tool that leverages LLM assistance to intelligently reorganize notes into dynamic topics, with auto-generated summaries that stay up-to-date.

## What Changes

- **New CLI application** (`memo`) for personal note organization
- **Topic-based organization** replacing traditional flat tagging - notes belong to one or more topics directly
- **LLM-powered suggestions** for topic assignment during import and note creation
- **Dynamic topic summaries** generated and versioned over time
- **Bidirectional sync** between SQLite database and markdown frontmatter
- **Local-first LLM** via Ollama with abstraction for future providers

## Capabilities

### New Capabilities

- `note-management`: Import, add, and synchronize markdown notes with the database. Parse frontmatter YAML, track file changes via hash, and maintain bidirectional sync between DB and files.
- `topic-management`: Create, list, show, rename, and delete topics. Topics aggregate notes dynamically and can have AI-generated summaries. Support for notes belonging to multiple topics (N:N relationship). Summaries are versioned for historical tracking.
- `llm-integration`: Abstract LLM provider interface with Ollama as default. Operations include: note classification into existing/new topics, topic summary generation, and topic proposal from unorganized notes.
- `cli-interface`: Command-line interface with commands for import, note/topic operations, and sync. Interactive workflows for LLM suggestions during import. Support for batch and individual operations.
- `storage`: SQLite database with FTS5 full-text search. Tables for notes, topics, note-topic relationships, and summary versions. Configurable storage path.

### Modified Capabilities

(None - this is a new application)

## Impact

- **New codebase**: TypeScript/Node.js CLI application
- **New dependencies**: SQLite driver, Ollama API client, markdown parser (frontmatter)
- **Local storage**: `~/memo/store/` (configurable) for markdown files, SQLite DB adjacent
- **LLM dependency**: Requires Ollama running locally for full functionality