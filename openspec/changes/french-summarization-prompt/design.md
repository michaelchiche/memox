## Context

The transcription summarization system currently generates summaries in English with a generic structure. The user has a proven French prompt that produces excellent results for voice note transcriptions - extracting ideas, organizing themes, removing verbal hesitations, and creating professional structured documents in French.

The current prompts in `src/prompts/summarize.ts` need to be replaced with French-optimized versions using the proven structure.

## Goals / Non-Goals

**Goals:**
- Replace English prompts with French language prompts
- Use the proven professional editing structure (H1 title, introduction, chapters with H2, subsections with H3, bullet points, conclusion)
- Remove verbal hesitations ("euh", "ben", "tu vois", "quoi", "en fait", etc.)
- Correct approximate phrasing while preserving speaker's intent and tone
- Extract actionable items into "Actions à entreprendre" section when mentioned
- Maintain the original language of the transcription (French in this case)

**Non-Goals:**
- Multi-language detection (assuming French input for now)
- Custom formatting options (single proven format)
- Voice transcription from audio files (text input only)

## Decisions

**1. Prompt Content - French Professional Editing Structure**
- **Decision**: Use the exact prompt structure provided by the user which has proven results
- **Rationale**: Real-world testing shows this produces high-quality, well-structured French summaries
- **Alternatives considered**: Keep English prompts (rejected: doesn't match user needs)

**2. Prompt Organization**
- **Decision**: Replace all three prompt builder functions (`buildTranscriptionSummaryPrompt`, `buildChunkSummaryPrompt`, `buildMergeSummariesPrompt`) with French versions
- **Rationale**: Consistency across all summarization flows, including chunked transcriptions
- **Alternatives considered**: Only change main prompt (rejected: confusing mixed language output)

**3. Output Format**
- **Decision**: Enforce strict markdown structure: Titre principal (H1), Introduction, Chapitres (H2), Sous-sections (H3), Points clés, Conclusion
- **Rationale**: Matches user's proven format, professional and readable
- **Alternatives considered**: Flexible format (rejected: inconsistent output quality)

**4. Action Items Section**
- **Decision**: Add "Actions à entreprendre" section when tasks are mentioned
- **Rationale**: Makes transcriptions actionable and useful for follow-up
- **Alternatives considered**: Inline action items (rejected: harder to extract)

## Risks / Trade-offs

- **LLM language handling**: Some LLMs may default to English → Explicitly instruct to maintain original language
- **Format adherence**: LLM might not follow strict formatting → Strong prompt structure with explicit examples
- **Content loss risk**: Aggressive summarization might lose meaning → Prompt explicitly says "sans perdre le sens original" and "ne rajoute pas d'informations absentes"