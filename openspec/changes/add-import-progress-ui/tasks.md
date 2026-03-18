## 1. Types and State Setup

- [ ] 1.1 Add `ImportStep` type definition in `src/commands/import.ts`
- [ ] 1.2 Create `FileProgress` interface to track file status
- [ ] 1.3 Add progress state tracking variables in `importNotes()`

## 2. Discovery Phase

- [ ] 2.1 Refactor `importNotes()` to separate discovery from processing loop
- [ ] 2.2 Move `globSync` call before processing loop
- [ ] 2.3 Store discovered files in array with initial status

## 3. Progress State Management

- [ ] 3.1 Create progress state object to track all files
- [ ] 3.2 Implement `updateProgress()` helper function
- [ ] 3.3 Add counters for imported, failed, and skipped files

## 4. Spinner Integration

- [ ] 4.1 Import and initialize `@clack/prompts` spinner
- [ ] 4.2 Add spinner start before processing loop
- [ ] 4.3 Implement spinner message updates for each step
- [ ] 4.4 Add spinner stop after processing complete

## 5. Step Progress Updates

- [ ] 5.1 Add progress update before `importNoteFromPath()` call (reading step)
- [ ] 5.2 Add progress update after note import (parsing step)
- [ ] 5.3 Add progress update before `summarizeNote()` call (summarizing step)
- [ ] 5.4 Add progress update before `classifyNote()` call (classifying step)
- [ ] 5.5 Add progress update before `setNoteTopics()` call (finalizing step)
- [ ] 5.6 Add progress update after file complete (done step)

## 6. Interactive Mode Handling

- [ ] 6.1 Pause spinner before interactive prompts (topic selection)
- [ ] 6.2 Resume spinner after user interaction complete
- [ ] 6.3 Handle manual topic input with spinner pause/resume

## 7. Error Handling

- [ ] 7.1 Wrap file processing in try-catch
- [ ] 7.2 Mark file as failed on error
- [ ] 7.3 Continue to next file on failure
- [ ] 7.4 Track error message for summary display

## 8. Summary Display

- [ ] 8.1 Track imported count throughout processing
- [ ] 8.2 Track failed count throughout processing
- [ ] 8.3 Track skipped count throughout processing
- [ ] 8.4 Display final summary with all counts
- [ ] 8.5 List failed files if any

## 9. Testing

- [ ] 9.1 Test with single file import
- [ ] 9.2 Test with multiple files (5+ files)
- [ ] 9.3 Test with --default flag
- [ ] 9.4 Test with --auto flag
- [ ] 9.5 Test with LLM available (summarization/classification steps)
- [ ] 9.6 Test with invalid file (error handling)
- [ ] 9.7 Test with empty directory (no files found)