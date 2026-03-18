## Why

Users importing large directories of notes have no visibility into the import process. When running `memo import <path>`, there's no indication of how many files will be processed, which file is currently being worked on, or what step is taking time. This is especially problematic when LLM summarization/classification is enabled, as these operations can take several seconds per file.

## What Changes

- Add pre-scan phase that discovers all files to import before processing begins
- Display list of files to be imported with their status (pending, in-progress, completed)
- Show current processing step for the active file (discovering, reading, parsing, hashing, summarizing, classifying, finalizing)
- Use `@clack/prompts` spinner for animated progress indication
- No changes to import functionality - purely additive UX improvement

## Capabilities

### New Capabilities
- `import-progress`: Display real-time progress during import with file list, current file indicator, and step-by-step status

### Modified Capabilities
None - this is a new capability that enhances the existing import command behavior without changing its requirements.

## Impact

- **Code**: `src/commands/import.ts` - main changes to add progress tracking
- **Libraries**: Uses existing `@clack/prompts` (already in dependencies)
- **APIs**: No public API changes
- **Breaking**: None - purely additive