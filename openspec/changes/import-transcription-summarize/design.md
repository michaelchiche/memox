## Context

The application currently imports markdown files and classifies them into topics using LLM. Users need to import plain text transcription files (`.txt`) and automatically generate structured summaries that get associated with topics.

The existing codebase has:
- Import system for `.md` files (`src/commands/import.ts`)
- Note and topic management (`src/lib/notes.ts`, `src/lib/topics.ts`)
- LLM provider integration (`src/providers/ollama.ts`)
- Topic association system (`src/lib/associations.ts`)

## Goals / Non-Goals

**Goals:**
- Support import of `.txt` transcription files alongside existing `.md` support
- Generate structured summaries from transcription content via LLM
- Associate transcriptions/summaries with topics
- Store both raw transcription and generated summary

**Non-Goals:**
- Audio/video transcription (only text import)
- Real-time processing (batch import only)
- Summary editing UI (handled separately)

## Decisions

**1. File Format Support**
- **Decision**: Extend existing import to support both `.md` and `.txt` files
- **Rationale**: Minimizes code duplication, leverages existing import infrastructure
- **Alternatives considered**: Separate import command for transcriptions (rejected: fragments user experience)

**2. Summary Generation**
- **Decision**: Store summaries as a new entity linked to the original note
- **Rationale**: Preserves the raw transcription while providing processed insights; allows re-generation
- **Alternatives considered**: Replace content with summary (rejected: loses original transcription data)

**3. LLM Prompt Strategy**
- **Decision**: Use domain-specific prompts optimized for transcription summarization
- **Rationale**: Transcriptions have different structure than typical notes (dialogue, timestamps, etc.)
- **Alternatives considered**: Use existing classification prompt (rejected: different use case)

**4. Topic Association**
- **Decision**: Generate summary first, then classify summary into topic using existing classification logic
- **Rationale**: Summaries are more representative of topic than raw transcription; reuses proven classification flow

## Risks / Trade-offs

- **Large file handling**: Long transcriptions may hit LLM token limits → Implement chunking strategy for files > context window
- **Summary quality**: LLM output quality varies → Store generation metadata for debugging, allow regeneration
- **Processing time**: Sequential LLM calls may be slow for batch imports → Consider parallel processing in future iteration