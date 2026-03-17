## ADDED Requirements

### Requirement: Note import from directory
The system SHALL allow importing all markdown files from a specified directory.
- Parse frontmatter YAML if present
- Extract title from frontmatter or first heading
- Store note content, metadata, and hash in database
- Create topics from existing frontmatter `topics` field if present

#### Scenario: Import directory with markdown files
- **WHEN** user runs `memo import ./notes/`
- **THEN** all `.md` files in directory are parsed and stored in database
- **AND** each note receives a unique ID
- **AND** file hash is computed and stored

#### Scenario: Import note with existing topics in frontmatter
- **WHEN** note contains `topics: [Alpha, Beta]` in frontmatter
- **THEN** topics "Alpha" and "Beta" are created if they don't exist
- **AND** note is associated with those topics

### Requirement: Bidirectional sync
The system SHALL maintain synchronization between database and markdown files.
- Database is source of truth for queries
- Frontmatter is always updated when topics change
- Hash comparison detects external file changes

#### Scenario: Topic added to note
- **WHEN** note is assigned to a new topic via CLI
- **THEN** database is updated with the association
- **AND** note's frontmatter `topics` field is updated
- **AND** file is rewritten with updated frontmatter

#### Scenario: File edited externally
- **WHEN** note file is modified outside the app
- **AND** user runs `memo sync` or any operation on that note
- **THEN** system detects hash mismatch
- **AND** parses updated frontmatter
- **AND** merges changes into database

#### Scenario: Conflict detected
- **WHEN** both database and file were modified
- **THEN** user is prompted to choose resolution
- **AND** selected version becomes canonical

### Requirement: Note content storage
The system SHALL store note content in database and sync to files.
- Content stored as plain text
- Frontmatter parsed and stored separately
- Hash computed from full file content

#### Scenario: Read note content
- **WHEN** user requests to view a note
- **THEN** system returns content from database
- **AND** verifies hash matches file

### Requirement: Frontmatter format
The system SHALL use YAML frontmatter for note metadata.

Supported fields:
- `title`: Note title
- `topics`: Array of topic names
- `created`: Creation date
- `updated`: Last modification date

#### Scenario: Parse frontmatter
- **WHEN** note file starts with `---`
- **THEN** content between `---` markers is parsed as YAML
- **AND** fields are extracted into note metadata

#### Scenario: Write frontmatter
- **WHEN** note is updated
- **THEN** frontmatter is written at top of file
- **AND** content follows after closing `---`