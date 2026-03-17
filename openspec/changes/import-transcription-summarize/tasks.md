## 1. Data Model & Database

- [x] 1.1 Create NoteSummary type in `src/types/index.ts` with id, noteId, content, version, generatedAt, generatedBy fields
- [x] 1.2 Create database migration for `note_summaries` table with id, note_id, version, content, generated_at columns
- [x] 1.3 Add summary management functions in `src/lib/summaries.ts` (createSummary, getLatestSummary, getSummaryHistory)

## 2. Transcription Import

- [x] 2.1 Extend glob pattern in `src/commands/import.ts` to include `.txt` files alongside `.md`
- [x] 2.2 Update `importNoteFromPath` in `src/lib/files.ts` to detect file type and parse `.txt` content
- [x] 2.3 Add title extraction logic for `.txt` files (use filename or first non-empty line as title)
- [x] 2.4 Update frontmatter parsing to skip for `.txt` files (no metadata expected)

## 3. LLM Summarization

- [x] 3.1 Create transcription summarization prompt in `src/prompts/summarize.ts` optimized for transcription format
- [x] 3.2 Add `generateSummary` method to LLM provider interface in `src/providers/types.ts`
- [x] 3.3 Implement `summarizeNote` function in `src/lib/generations.ts` that calls LLM with summarization prompt
- [x] 3.4 Add token estimation and chunking logic in `src/lib/chunking.ts` for files exceeding context window
- [x] 3.5 Implement chunk merging logic to combine partial summaries into final output

## 4. Topic Association

- [x] 4.1 Update import flow in `src/commands/import.ts` to trigger summary generation for `.txt` files after import
- [x] 4.2 Modify topic classification to use generated summary content instead of raw transcription for better accuracy
- [x] 4.3 Store summary generation metadata using existing `createGeneration` function
- [x] 4.4 Associate summary with note using the new NoteSummary entity

## 5. Error Handling & Edge Cases

- [x] 5.1 Add graceful degradation when LLM unavailable (import transcription without summary)
- [x] 5.2 Add error handling for LLM failures during summarization (log and continue)
- [x] 5.3 Handle empty transcription files with appropriate warning
- [x] 5.4 Add file encoding detection and handling for various text encodings

## 6. Testing

- [x] 6.1 Add unit tests for `.txt` file parsing in import flow
- [x] 6.2 Add unit tests for summary generation with mock LLM provider
- [x] 6.3 Add integration tests for full import-summarize-associate pipeline
- [x] 6.4 Test chunking behavior with large transcription files