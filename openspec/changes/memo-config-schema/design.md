## Context

Memo CLI tool uses YAML configuration files (`memo.yaml` and `.memorc.yaml`) for user settings. The configuration includes:
- `storePath`: Path where notes are stored
- `dbPath`: Path to the SQLite database
- `llm`: LLM provider configuration (provider, model, baseUrl, apiKey)
- `defaultTopic`: Default topic for unclassified notes

Currently, users have no IDE support when editing these files, leading to potential errors like typos in property names, invalid provider values, or missing required fields.

## Goals / Non-Goals

**Goals:**
- Provide a JSON Schema file that enables autocomplete and validation in IDEs
- Document all configuration options with descriptions and examples
- Support YAML-specific features where applicable

**Non-Goals:**
- Runtime validation of config files (already handled by TypeScript types)
- Migration tooling for config files
- Schema versioning support

## Decisions

### Schema file location
**Decision**: Place `memo-config.schema.json` in a `schemas/` directory at the project root.

**Rationale**: Keeps schemas organized and separate from source code. Makes it easy to publish schemas to a URL later if desired.

**Alternatives considered**:
- Project root: Clutters root directory
- `src/` directory: Mixes schema with source code

### Schema format
**Decision**: Use JSON Schema Draft 2020-12.

**Rationale**: Most widely supported draft version with good IDE support (VS Code, JetBrains, etc.).

### Property naming
**Decision**: Use exact same property names as TypeScript `Config` interface for consistency.

**Rationale**: Avoids confusion between schema and code; single source of truth.

## Risks / Trade-offs

**Schema drift** → Document that schema must be updated when Config interface changes
**YAML vs JSON differences** → Schema will work for both since VS Code's YAML extension supports JSON Schema