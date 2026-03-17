## ADDED Requirements

### Requirement: Generate structured summary from transcription
The system SHALL use LLM to generate a structured summary from raw transcription content.

#### Scenario: Summary generation for transcription
- **WHEN** a transcription file is imported
- **THEN** system invokes LLM with transcription-specific prompt to generate summary

#### Scenario: Summary structure
- **WHEN** LLM generates summary
- **THEN** summary includes key topics, action items, and main points identified

### Requirement: Handle large transcriptions
The system SHALL handle transcription files that exceed LLM context window limits.

#### Scenario: Chunk large file
- **WHEN** transcription content exceeds LLM token limit
- **THEN** system splits content into chunks for processing

#### Scenario: Merge chunk summaries
- **WHEN** processing large transcriptions in chunks
- **THEN** system combines chunk results into cohesive summary

### Requirement: Store generation metadata
The system SHALL record LLM generation details for each summary.

#### Scenario: Record generation info
- **WHEN** summary is generated
- **THEN** system stores provider, model, and token usage information

#### Scenario: Track summary version
- **WHEN** summary is regenerated
- **THEN** system creates new version while preserving history

### Requirement: Graceful degradation without LLM
The system SHALL handle cases where LLM is unavailable.

#### Scenario: LLM unavailable
- **WHEN** LLM provider is not accessible
- **THEN** system still imports transcription but skips summary generation

#### Scenario: LLM error during generation
- **WHEN** LLM returns an error
- **THEN** system logs error and proceeds with import without summary