## ADDED Requirements

### Requirement: Schema defines storePath property
The schema SHALL define `storePath` as an optional string property with description and default value.

#### Scenario: storePath autocomplete
- **WHEN** user types `storePath` in config file
- **THEN** IDE shows description "Directory where notes are stored"

#### Scenario: storePath default
- **WHEN** user does not specify storePath
- **THEN** schema indicates default value is `~/memo`

### Requirement: Schema defines dbPath property
The schema SHALL define `dbPath` as an optional string property with description and default value.

#### Scenario: dbPath autocomplete
- **WHEN** user types `dbPath` in config file
- **THEN** IDE shows description "Path to the SQLite database file"

### Requirement: Schema defines llm configuration object
The schema SHALL define `llm` as an object with required `provider` and `model` properties, and optional `baseUrl` and `apiKey`.

#### Scenario: llm provider autocomplete
- **WHEN** user types `provider` under `llm`
- **THEN** IDE shows allowed enum values: `ollama`, `openai`

#### Scenario: llm model autocomplete
- **WHEN** user types `model` under `llm`
- **THEN** IDE shows description "LLM model name (e.g., llama3.2, mistral)"

#### Scenario: llm baseUrl optional
- **WHEN** user provides `baseUrl` under `llm`
- **THEN** schema validates it as a string URI format

#### Scenario: llm apiKey optional
- **WHEN** user provides `apiKey` under `llm`
- **THEN** schema validates it as a string

### Requirement: Schema defines defaultTopic property
The schema SHALL define `defaultTopic` as an optional string property with description and default value.

#### Scenario: defaultTopic autocomplete
- **WHEN** user types `defaultTopic` in config file
- **THEN** IDE shows description "Default topic for unclassified notes"

### Requirement: Schema file location and naming
The schema file SHALL be located at `schemas/memo-config.schema.json`.

#### Scenario: schema file accessible
- **WHEN** project is built or published
- **THEN** schema file is available at `schemas/memo-config.schema.json`

### Requirement: Schema supports $schema reference
The schema SHALL allow users to reference it via `$schema` property in their config files.

#### Scenario: config file references schema
- **WHEN** user adds `$schema: ./schemas/memo-config.schema.json` to config
- **THEN** IDE provides autocomplete for all config properties