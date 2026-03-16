## ADDED Requirements

### Requirement: SQLite database
The system SHALL use SQLite for local storage.
- Single database file
- Located alongside store directory (default: `~/memo/memo.db`)
- Created automatically on first run

#### Scenario: Initialize database
- **WHEN** user runs memo for the first time
- **THEN** database file is created
- **AND** all required tables are initialized

### Requirement: Notes table
The system SHALL store notes with the following schema:
- `id`: unique identifier (UUID)
- `path`: relative file path
- `title`: note title
- `content`: full note content
- `hash`: content hash for change detection
- `created_at`: creation timestamp
- `updated_at`: last modification timestamp

#### Scenario: Store imported note
- **WHEN** note is imported
- **THEN** note record is created with all fields
- **AND** hash is computed and stored

### Requirement: Topics table
The system SHALL store topics with the following schema:
- `id`: unique identifier (UUID)
- `name`: topic name (unique)
- `description`: optional description
- `created_at`: creation timestamp
- `updated_at`: last modification timestamp

#### Scenario: Create topic
- **WHEN** topic is created
- **THEN** topic record is created
- **AND** name uniqueness is verified

### Requirement: Note-topics junction table
The system SHALL store note-topic relationships.
- `note_id`: reference to note
- `topic_id`: reference to topic
- `created_at`: when association was created
- Composite primary key (note_id, topic_id)

#### Scenario: Associate note with topic
- **WHEN** note is added to topic
- **THEN** junction record is created
- **AND** duplicate associations are ignored

### Requirement: Topic summaries table
The system SHALL store versioned topic summaries.
- `id`: unique identifier
- `topic_id`: reference to topic
- `version`: summary version number
- `content`: summary text
- `generated_at`: generation timestamp

#### Scenario: Store new summary version
- **WHEN** summary is generated
- **THEN** new record is created
- **AND** version number is incremented

#### Scenario: Retrieve summary history
- **WHEN** user requests history
- **THEN** all versions for topic are returned
- **AND** sorted by version descending

### Requirement: Full-text search
The system SHALL support full-text search on note content.
- FTS5 virtual table for notes
- Search by note content
- Search by note title

#### Scenario: Search notes by content
- **WHEN** user searches for "API architecture"
- **THEN** notes containing those terms are returned
- **AND** results are ranked by relevance

### Requirement: Configurable storage path
The system SHALL allow configuring storage location.
- Default: `~/memo/store/`
- Configured via config file or environment variable
- Database located alongside store

#### Scenario: Use default storage path
- **WHEN** no custom path configured
- **THEN** notes are stored in `~/memo/store/`
- **AND** database at `~/memo/memo.db`

#### Scenario: Configure custom path
- **WHEN** user sets custom path
- **THEN** notes and database use new location
- **AND** existing data is migrated

### Requirement: File storage
The system SHALL store notes as markdown files.
- One file per note
- YAML frontmatter for metadata
- Human-readable and portable

#### Scenario: Write note file
- **WHEN** note is created or updated
- **THEN** file is written to storage path
- **AND** frontmatter includes topics, title, dates

### Requirement: Hash-based change detection
The system SHALL detect file changes via content hash.
- SHA-256 hash of file content
- Hash stored in database
- Comparison triggers sync

#### Scenario: Detect external edit
- **WHEN** file is modified outside memo
- **THEN** hash comparison detects change
- **AND** sync process is triggered

### Requirement: Query indexes
The system SHALL maintain indexes for efficient queries.
- Index on topics.name
- Index on notes.path
- Index on note_topics composite key

#### Scenario: Query notes by topic
- **WHEN** user requests notes for topic
- **THEN** query uses junction table index
- **AND** results returned efficiently