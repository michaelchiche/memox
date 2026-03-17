## 1. Prompt Updates

- [x] 1.1 Replace `buildTranscriptionSummaryPrompt` with French professional editing prompt in `src/prompts/summarize.ts`
- [x] 1.2 Update `buildChunkSummaryPrompt` to use French language for chunk processing
- [x] 1.3 Update `buildMergeSummariesPrompt` to use French language for merging summaries
- [x] 1.4 Add French prompt constants for verbal hesitations to remove and formatting rules

## 2. Testing

- [x] 2.1 Test summary generation with French transcription containing verbal hesitations
- [x] 2.2 Test chunk merging produces coherent French output
- [x] 2.3 Verify action items section is created when tasks are mentioned
- [x] 2.4 Verify markdown formatting (H1, H2, H3, bold, bullets) is correct