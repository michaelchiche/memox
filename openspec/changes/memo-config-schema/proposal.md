## Why

Users editing `memo.yaml` or `.memorc.yaml` config files manually have no autocomplete, validation, or documentation assistance. A JSON Schema file would enable IDE autocomplete and validation, improving the developer experience and reducing configuration errors.

## What Changes

- Add a JSON Schema file (`memo-config.schema.json`) that defines the structure and validation rules for memo config files
- Document all available config options with descriptions and default values
- Include validation for LLM provider types (`ollama` | `openai`)
- Support both local (`memo.yaml`) and global (`.memorc.yaml`) config file schemas

## Capabilities

### New Capabilities
- `config-schema`: JSON Schema definition for memo configuration files, enabling IDE autocomplete and validation

### Modified Capabilities
- None

## Impact

- New file: `memo-config.schema.json` in the project root (or schemas directory)
- Users can reference the schema from their config files via `$schema` property
- No breaking changes to existing functionality
- Improves developer experience for usersediting config files manually