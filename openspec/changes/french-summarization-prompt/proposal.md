## Why

The current summarization prompts generate summaries in English, but the primary use case involves French transcriptions. Users need French-language summaries that use professional editing techniques - organizing disorganized transcriptions into structured, clear documents with proper French formatting and linguistic conventions.

## What Changes

- Replace English summarization prompts with French-optimized versions
- Use the proven prompt structure that produces high-quality structured summaries
- Generate summaries with proper French markdown formatting (H1, H2, H3 hierarchy)
- Extract and organize ideas from disorganized transcriptions
- Create actionable "Actions à entreprendre" sections when tasks are mentioned
- Remove verbal hesitations and correct approximate phrasing while preserving intent

## Capabilities

### New Capabilities

- `french-summary-format`: Generate structured French summaries with professional editing (title, introduction, chapters, subsections, key points, conclusion)

### Modified Capabilities

- `llm-summarization`: Update prompt to use French language output and professional editing structure instead of generic English summaries

## Impact

- Modified files:
  - `src/prompts/summarize.ts` - Replace English prompts with French-optimized version
  - `src/providers/ollama.ts` - Ensure French language handling in responses
- Existing summaries will continue to work; new summaries will use French format
- No database changes required
- No breaking changes to API or existing functionality