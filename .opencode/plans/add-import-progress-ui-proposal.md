## Proposal for: add-import-progress-ui

> After plan approval, run: `openspec new change "add-import-progress-ui"` and copy artifacts to `openspec/changes/add-import-progress-ui/`

---

### proposal.md

```markdown
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
```

---

### design.md

```markdown
## Overview

Enhance the import command with real-time progress visibility showing:
1. Total file count discovered
2. List of files with status indicators
3. Current file being processed
4. Current processing step

## Architecture

### Current Flow
```
import(path) → globSync → for-each: processFile()
```

### New Flow
```
import(path) → globSync (show file list) → for-each: processFile(statusCallback)
```

### Component Changes

#### src/commands/import.ts

**Before:**
- Files discovered inline during processing
- No progress indication
- Silent during LLM operations

**After:**
- Separate discovery phase with file list display
- `@clack/prompts.spinner()` for animated progress
- Status callback passed to processing functions
- Step-by-step progress messages

### Progress States

| Step | Description | When to Show |
|------|-------------|--------------|
| `discovering` | Scanning directory | Before globSync |
| `reading` | Reading file content | readNoteFile() start |
| `parsing` | Extracting frontmatter | During parse |
| `hashing` | Computing content hash | hash computation |
| `summarizing` | LLM summarization | For .txt files with LLM |
| `classifying` | LLM topic classification | When calling classifyNote() |
| `finalizing` | Database write | setNoteTopics() |
| `done` | File complete | After successful import |

### Display Format

```
◈ Importing 5 files...

  ◓ notes/project-alpha.md → Summarizing... (step 4/7)
  
  ○ notes/beta.txt (pending)
  ○ notes/gamma.md (pending)
  ○ notes/delta.txt (pending)
  ✓ notes/completed.md (done)
```

Legend:
- `○` pending
- `◐` in-progress (file being processed)
- `✓` completed
- `✗` failed (if errors occur)

### Error Handling

- Failed files still show in list with error indicator
- Continue processing remaining files
- Summary shows success/failure counts

## Technical Details

### Spinner Usage

```typescript
import p from '@clack/prompts';

const spinner = p.spinner();
spinner.start('Discovering files...');

// Update message for each step
spinner.message(`Processing ${filename} - Reading...`);

// On completion
spinner.stop('Import complete: 5 files processed');
```

### Progress Callback Type

```typescript
type ProgressCallback = (filename: string, step: ImportStep) => void;

type ImportStep = 
  | 'discovering'
  | 'reading'
  | 'parsing'
  | 'hashing'
  | 'summarizing'
  | 'classifying'
  | 'finalizing'
  | 'done';
```

### Integration Points

1. **importAction()** - Add discovery phase and spinners
2. **processFiles()** - Accept and call progress callback
3. **importNoteFromPath()** - No changes (called internally)

No changes needed to:
- `src/lib/files.ts` - Core file processing unchanged
- `src/lib/notes.ts` - Database operations unchanged
- `src/lib/summaries.ts` - LLM calls unchanged
```

---

### specs/import-progress/spec.md

```markdown
# Import Progress

Display real-time progress during import with file list, current file indicator, and step-by-step status.

## Requirements

### REQ-001: File Discovery
The system SHALL display all files discovered for import before processing begins.

### REQ-002: File List Display
The system SHALL show a list of all files to be imported with their current status (pending, in-progress, completed, failed).

### REQ-003: Current File Indicator
The system SHALL visually indicate which file is currently being processed.

### REQ-004: Step Indicator
The system SHALL display the current processing step for the file being import. Steps include:
- discovering
- reading
- parsing
- hashing
- summarizing (when LLM processing .txt files)
- classifying (when LLM topic classification is used)
- finalizing
- done

### REQ-005: Progress Animation
The system SHALL use animated progress indicators (e.g., spinner) to indicate ongoing operations.

### REQ-006: Summary Display
The system SHALL display a summary after import completion showing:
- Total files processed
- Successful imports
- Failed imports (if any)

### REQ-007: Error Handling
The system SHALL continue processing remaining files if one file fails, displaying error status for failed files.

## Out of Scope

- Interactive file selection/filtering
- Parallel processing
- Progress persistence or resumable imports
```

---

### tasks.md

```markdown
# Implementation Tasks

## Phase 1: Core Progress Infrastructure

- [ ] **T001**: Add `ImportStep` type definition in `src/commands/import.ts`
  - Define steps: discovering, reading, parsing, hashing, summarizing, classifying, finalizing, done
- [ ] **T002**: Create `ProgressCallback` type in `src/commands/import.ts`
- [ ] **T003**: Add progress state tracking variables in `importAction()`

## Phase 2: Discovery Phase

- [ ] **T004**: Refactor `importAction()` to separate discovery from processing
  - Move globSync to run before processing loop
  - Store discovered files in array
- [ ] **T005**: Add file count display after discovery
  - Show "Found N files to import" message
- [ ] **T006**: Initialize progress display with file list
  - Use `@clack/prompts` spinner
  - Show all files in pending state

## Phase 3: Progress Updates

- [ ] **T007**: Add spinner instance and start/stop logic
- [ ] **T008**: Call progress callback at each processing step
  - reading: before `readNoteFile()`
  - hashing: before `computeHash()` (if exists)
  - summarizing: before `summarizeNote()` for .txt files
  - classifying: before LLM topic classification
  - finalizing: before `setNoteTopics()`
  - done: after file completes
- [ ] **T009**: Handle interactive mode progress
  - Pause spinner during `p.select()` prompts
  - Resume after selection

## Phase 4: Summary Display

- [ ] **T010**: Track success/failure counts
- [ ] **T011**: Display final summary
  - Show total processed, succeeded, failed
- [ ] **T012**: Update outro message with counts

## Phase 5: Testing & Polish

- [ ] **T013**: Test with single file
- [ ] **T014**: Test with multiple files
- [ ] **T015**: Test with LLM enabled (--auto mode)
- [ ] **T016**: Test error handling (invalid files)
- [ ] **T017**: Verify progress display on different terminals
```

---

## Summary

- **Change**: `add-import-progress-ui`
- **Location**: `openspec/changes/add-import-progress-ui/`
- **Artifacts to create**: proposal.md, design.md, specs/import-progress/spec.md, tasks.md

**To implement**: Copy the artifacts above to `openspec/changes/add-import-progress-ui/` and run `/opsx-apply`