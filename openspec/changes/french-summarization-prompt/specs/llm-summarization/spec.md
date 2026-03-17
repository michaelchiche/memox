## MODIFIED Requirements

### Requirement: Generate structured summary from transcription
The system SHALL use LLM to generate a structured summary from raw transcription content.

#### Scenario: Summary generation for transcription
- **WHEN** a transcription file is imported
- **THEN** system invokes LLM with French transcription-specific prompt to generate summary in French

#### Scenario: Summary structure
- **WHEN** LLM generates summary
- **THEN** summary includes titre principal, introduction, chapitres thématiques, points clés, actions à entreprendre (if applicable), and conclusion following French professional format