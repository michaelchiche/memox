## ADDED Requirements

### Requirement: Associate transcription with topic
The system SHALL link imported transcriptions to topics for organization.

#### Scenario: Auto-assign topic from LLM classification
- **WHEN** transcription and summary are imported
- **THEN** system uses existing topic classification logic to suggest topics

#### Scenario: Manual topic selection
- **WHEN** user imports transcription
- **THEN** user can select or create topic from LLM-suggested options

### Requirement: Link summary to topic
The system SHALL associate generated summaries with the same topic as parent transcription.

#### Scenario: Summary topic inheritance
- **WHEN** transcription is assigned to a topic
- **THEN** generated summary inherits the same topic association

### Requirement: Support default topic assignment
The system SHALL assign transcriptions to default topic when no topic is specified.

#### Scenario: No topic available
- **WHEN** no existing topics and LLM unavailable
- **THEN** system assigns transcription to default topic "Non classée"

#### Scenario: Skip topic assignment
- **WHEN** user chooses to skip topic selection
- **THEN** system assigns transcription to default topic