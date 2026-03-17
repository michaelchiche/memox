## ADDED Requirements

### Requirement: Generate French structured summaries
The system SHALL generate summaries in French with professional editing structure.

#### Scenario: French language output
- **WHEN** a transcription is summarized
- **THEN** summary is written in French with proper French formatting and conventions

#### Scenario: Professional document structure
- **WHEN** LLM generates French summary
- **THEN** summary follows structure: Titre principal (H1), Introduction, Chapitres (H2), Sous-sections (H3), Points clés (bullet lists), Conclusion

### Requirement: Clean disorganized transcriptions
The system SHALL transform disorganized voice transcriptions into professional documents.

#### Scenario: Remove verbal hesitations
- **WHEN** processing transcriptions with verbal hesitations ("euh", "ben", "tu vois", "quoi", "en fait", etc.)
- **THEN** summary removes all hesitations from the output

#### Scenario: Correct approximate phrasing
- **WHEN** transcription contains approximate or unclear phrasing
- **THEN** summary corrects phrasing while preserving speaker's original intent and tone

#### Scenario: Preserve original meaning
- **WHEN** reformulating content for clarity
- **THEN** system does NOT add information absent from source and does NOT lose original meaning

### Requirement: Organize ideas thematically
The system SHALL extract and reorganize ideas from mixed transcriptions.

#### Scenario: Extract distinct ideas
- **WHEN** transcription contains multiple mixed ideas or topics
- **THEN** system identifies and extracts each distinct idea or theme

#### Scenario: Group related ideas
- **WHEN** multiple ideas are related
- **THEN** system groups them into thematic chapters or sections

#### Scenario: Logical ordering
- **WHEN** organizing content into sections
- **THEN** system orders ideas in coherent structure (chronological, logical, or by priority)

### Requirement: Extract action items
The system SHALL identify and highlight actionable items from transcriptions.

#### Scenario: Create action section
- **WHEN** transcription mentions tasks or actions to undertake
- **THEN** summary includes "Actions à entreprendre" section at the end

#### Scenario: Format action items
- **WHEN** actions are extracted
- **THEN** actions are presented as bullet points for easy follow-up

### Requirement: Use markdown formatting
The system SHALL format French summaries with proper markdown hierarchy.

#### Scenario: Header hierarchy
- **WHEN** generating summary
- **THEN** system uses H1 for main title, H2 for chapters, H3 for subsections

#### Scenario: Emphasize key content
- **WHEN** crucial concepts or conclusions are identified
- **THEN** system formats them with **bold** text

#### Scenario: Bullet points for lists
- **WHEN** listing key points or action items
- **THEN** system uses markdown bullet points