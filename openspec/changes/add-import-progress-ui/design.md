## Context

The `memo import` command currently processes files without any progress indication. Users have no visibility into:
- How many files will be imported
- Which file is currently being processed
- What step is taking time (especially during LLM operations that can take several seconds per file)

The codebase already uses `@clack/prompts` for interactive CLI elements (intro/outro, select menus). This design leverages the same library's spinner component for progress indication.

## Goals / Non-Goals

**Goals:**
- Show file list before processing begins
- Display real-time progress with current file and step
- Indicate which files completed, are pending, or failed
- Provide final summary of import results

**Non-Goals:**
- Interactive file selection/filtering (user confirmed: view only)
- Parallel file processing (sequential only)
- Progress persistence or resumable imports
- Changes to core import logic (purely additive UI layer)

## Decisions

### D1: Use @clack/prompts spinner for progress
**Rationale:** Already in dependencies, consistent with existing CLI style, provides animated spinner with message updates.
**Alternatives considered:**
- Custom progress bar - more work, inconsistent with existing CLI
- ora spinner - would add new dependency

### D2: Discover files upfront (pre-scan)
**Rationale:** Allows showing total count and file list before processing begins.
**Trade-off:** Slight overhead for directory scan, but better UX.

### D3: Sequential processing with step callbacks
**Rationale:** Process files one at a time, calling progress callback at each major step.
**Steps tracked:** `discovering` → `reading` → `hashing` → `summarizing` → `classifying` → `finalizing` → `done`

### D4: Spinner pauses during interactive prompts
**Rationale:** In interactive mode, `p.select()` prompts for topic selection. Spinner should pause during these prompts and resume after.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Spinner flicker on slow terminals | @clack/prompts handles terminal capability detection |
| Large file lists overflow terminal | Show count summary, truncate list if > 50 files |
| Error during LLM step | Continue processing, mark file as failed, show in summary |

## Implementation Outline

1. **Discovery phase**: Run `globSync` first, display file count
2. **Progress state**: Track `{ current, step, completed, failed }` per file
3. **Spinner lifecycle**: Start before loop, update message on each step, stop at end
4. **Interactive mode**: Spinner pauses during `p.select()`, resumes after selection
5. **Error handling**: Catch per-file errors, mark as failed, continue loop
6. **Summary**: Show `X imported, Y failed, Z skipped` in outro