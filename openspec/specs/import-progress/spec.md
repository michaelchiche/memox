## ADDED Requirements

### Requirement: File Discovery Display
The system SHALL display the count of files discovered for import before processing begins.

#### Scenario: Multiple files discovered
- **WHEN** user imports a directory containing multiple .md or .txt files
- **THEN** system displays "Found N files to import" message
- **AND** system lists all file paths with pending status indicators

#### Scenario: No files found
- **WHEN** user imports a directory with no .md or .txt files
- **THEN** system displays "No files found to import" message
- **AND** system exits without error

### Requirement: File List Status Display
The system SHALL show a list of all files to be imported with their current status.

#### Scenario: Files listed before processing
- **WHEN** discovery phase completes
- **THEN** system displays all discovered files
- **AND** each file shows status: pending (○), in-progress (◐), completed (✓), or failed (✗)

#### Scenario: Status updates during processing
- **WHEN** a file transitions between states
- **THEN** the display updates to reflect the current status
- **AND** only one file shows in-progress at a time

### Requirement: Current File Indicator
The system SHALL visually indicate which file is currently being processed.

#### Scenario: File being processed
- **WHEN** processing begins on a file
- **THEN** that file shows in-progress indicator (◐)
- **AND** all other files show pending (○), completed (✓), or failed (✗)

### Requirement: Step Progress Indicator
The system SHALL display the current processing step for the file being imported.

#### Scenario: Step transitions during import
- **WHEN** processing a file through import steps
- **THEN** system displays current step: discovering, reading, parsing, hashing, summarizing, classifying, finalizing, or done
- **AND** LLM-specific steps (summarizing, classifying) only show when applicable

#### Scenario: Text file with LLM available
- **WHEN** importing a .txt file with LLM available
- **THEN** system displays summarizing step
- **AND** system displays classifying step

#### Scenario: Markdown file without LLM
- **WHEN** importing a .md file without LLM
- **THEN** system skips summarizing and classifying steps
- **AND** displays only reading, parsing, hashing, finalizing, done steps

### Requirement: Progress Animation
The system SHALL use animated progress indicators to show ongoing operations.

#### Scenario: Long-running operation
- **WHEN** processing steps take time (LLM calls, large files)
- **THEN** system displays animated spinner
- **AND** spinner message updates with current step

### Requirement: Import Summary Display
The system SHALL display a summary after import completion.

#### Scenario: Successful import
- **WHEN** all files process successfully
- **THEN** system displays total count imported
- **AND** system displays "Import complete" message

#### Scenario: Partial failure import
- **WHEN** some files fail during import
- **THEN** system displays count of successful imports
- **AND** system displays count of failed imports
- **AND** system lists failed files with error details

### Requirement: Error Handling During Import
The system SHALL continue processing remaining files if one file fails.

#### Scenario: File processing error
- **WHEN** an error occurs processing a file
- **THEN** system marks that file as failed (✗)
- **AND** system continues to next file
- **AND** failure is counted in final summary

#### Scenario: LLM timeout or error
- **WHEN** LLM summarization/classification fails on a file
- **THEN** system logs warning message
- **AND** system continues processing
- **AND** file may proceed with fallback topic assignment