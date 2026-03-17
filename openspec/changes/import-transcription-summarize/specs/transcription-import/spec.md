## ADDED Requirements

### Requirement: Import text transcription files
The system SHALL allow users to import `.txt` files containing transcriptions.

#### Scenario: Import single text file
- **WHEN** user provides a path to a `.txt` file
- **THEN** system reads the file content and stores it as a note

#### Scenario: Import directory of text files
- **WHEN** user provides a directory path containing multiple `.txt` files
- **THEN** system imports all `.txt` files from that directory

#### Scenario: Handle mixed file types
- **WHEN** user provides a directory containing both `.md` and `.txt` files
- **THEN** system imports both file types with appropriate processing

### Requirement: Parse transcription content
The system SHALL extract metadata from transcription files including title and content.

#### Scenario: Extract transcription content
- **WHEN** importing a `.txt` file
- **THEN** system extracts the full text content as the note body

#### Scenario: Generate default title
- **WHEN** importing a `.txt` file without explicit title
- **THEN** system generates a title from the filename or first line of content

### Requirement: Support file system paths
The system SHALL accept both absolute and relative file system paths for import.

#### Scenario: Absolute path import
- **WHEN** user provides an absolute file path
- **THEN** system imports from that exact location

#### Scenario: Relative path import
- **WHEN** user provides a relative file path
- **THEN** system resolves the path relative to current working directory