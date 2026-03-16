## ADDED Requirements

### Requirement: Topic creation
The system SHALL allow creating topics manually.
- Topic name MUST be unique
- Topic creation MUST be case-insensitive for uniqueness check
- Empty topic name MUST be rejected

#### Scenario: Create new topic
- **WHEN** user runs `memo topic create "Project Alpha"`
- **THEN** topic "Project Alpha" is created
- **AND** topic has unique ID
- **AND** topic has empty summary initially

#### Scenario: Duplicate topic name rejected
- **WHEN** user runs `memo topic create "Alpha"` and "Alpha" already exists
- **THEN** operation fails with error message
- **AND** existing topic is not modified

### Requirement: Topic listing
The system SHALL allow listing all topics.
- Display topic name and note count
- Support sorting by name or note count

#### Scenario: List all topics
- **WHEN** user runs `memo topic list`
- **THEN** all topics are displayed
- **AND** each topic shows its note count

### Requirement: Topic display
The system SHALL allow viewing topic details.
- Show topic name, description, note count
- Show generated summary if available
- Show summary generation timestamp

#### Scenario: Show topic with notes
- **WHEN** user runs `memo topic show "Project Alpha"`
- **THEN** topic details are displayed
- **AND** summary is shown if generated
- **AND** list of all notes in topic is shown

### Requirement: Topic rename
The system SHALL allow renaming topics.
- Update topic name in database
- Update frontmatter in all associated notes
- Preserve all note associations

#### Scenario: Rename topic
- **WHEN** user runs `memo topic rename "Alpha" "Beta"`
- **THEN** topic name changes from "Alpha" to "Beta"
- **AND** all notes with topic "Alpha" have frontmatter updated to "Beta"

### Requirement: Topic deletion
The system SHALL allow deleting topics.
- Remove topic from database
- Remove topic from all note frontmatters
- Notes are not deleted, only disassociated

#### Scenario: Delete topic
- **WHEN** user runs `memo topic delete "Alpha"`
- **THEN** topic "Alpha" is removed from database
- **AND** all notes lose the "Alpha" topic from frontmatter
- **AND** notes remain in database

### Requirement: Note-topic association
The system SHALL support notes belonging to multiple topics.
- N:N relationship between notes and topics
- Adding a topic to a note does not remove existing topics
- Removing a topic from a note does not affect other notes

#### Scenario: Add note to multiple topics
- **WHEN** note is added to topic "Alpha" and topic "Urgent"
- **THEN** note appears in both topic views
- **AND** note frontmatter shows `topics: [Alpha, Urgent]`

### Requirement: Topic summary generation
The system SHALL generate summaries for topics using LLM.
- Summary is generated on demand
- Summary is stored with version number
- Previous summaries are retained for history

#### Scenario: Generate topic summary
- **WHEN** user runs `memo topic summarize "Alpha"`
- **THEN** LLM generates summary from all notes in topic
- **AND** summary is stored in database
- **AND** version number increments

#### Scenario: View summary history
- **WHEN** user runs `memo topic history "Alpha"`
- **THEN** all summary versions are displayed
- **AND** each version shows timestamp and content

### Requirement: Default topic for unclassified notes
The system SHALL provide a default topic for notes without classification.
- Topic named "Non classée" (or configurable)
- Notes skipped during import go to this topic
- Notes can be moved out of default topic

#### Scenario: Note without topics
- **WHEN** note has no topics assigned during import
- **AND** user skips topic selection
- **THEN** note is assigned to "Non classée" topic