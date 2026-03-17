## Why

Users currently have no guided way to set up `memo`. The first-run experience requires manually creating config files or relying on implicit defaults. A dedicated `init` command would provide a clear entry point, help users understand their configuration options, and ensure the database and directories are properly initialized before any operations.

## What Changes

- New command: `memo init` - initializes configuration with sensible defaults
- New command: `memo init --global` - initializes global configuration at `~/.memorc.yaml`
- Creates directory structure and initializes SQLite database
- Hybrid UX: shows defaults, asks if user wants to customize
- Handles existing config files gracefully with overwrite prompt

## Capabilities

### New Capabilities

- `cli-init`: Command-line initialization flow for setting up memo configuration, including:
  - Config file creation (local `./memo.yaml` or global `~/.memorc.yaml`)
  - Directory structure creation (storePath)
  - Database initialization
  - Interactive customization prompt (optional)

### Modified Capabilities

None - this is a new capability that doesn't modify existing spec-level behavior.

## Impact

- **New files**: `src/commands/init.ts` - handler for init command
- **Modified files**: `src/commands/index.ts` - register init command
- **Dependencies**: Uses existing `@clack/prompts` for interactive prompts
- **No breaking changes**: Existing behavior unaffected, this is additive