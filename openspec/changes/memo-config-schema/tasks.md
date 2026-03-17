## 1. Schema Structure

- [x] 1.1 Create `schemas/` directory at project root
- [x] 1.2 Create `schemas/memo-config.schema.json` with JSON Schema Draft 2020-12 structure

## 2. Schema Content

- [x] 2.1 Define `storePath` property (type: string, optional, description, default)
- [x] 2.2 Define `dbPath` property (type: string, optional, description)
- [x] 2.3 Define `llm` object with `provider` (enum: ollama/openai), `model` (string, required), `baseUrl` (string, format: uri, optional), `apiKey` (string, optional)
- [x] 2.4 Define `defaultTopic` property (type: string, optional, description, default: "Non classée")
- [x] 2.5 Add `$schema` property definition to allow schema reference

## 3. Documentation

- [x] 3.1 Update README.md to document how to use the schema with `$schema` reference
- [x] 3.2 Add example config file showing schema reference usage

## 4. Package Integration

- [x] 4.1 Update package.json to include schemas directory in published files
- [x] 4.2 Verify schema file is included after build/publish