## ADDED Requirements

### Requirement: CLI installation
The system SHALL be installable as a global CLI command.
- Command name: `memo`
- Support for common package managers (npm, yarn)
- Executable from any directory

#### Scenario: Install globally via npm
- **WHEN** user runs `npm install -g memo`
- **THEN** `memo` command is available globally
- **AND** can be run from any directory

### Requirement: Help and documentation
The system SHALL provide help for all commands.
- `memo --help` shows available commands
- `memo <command> --help` shows command-specific help
- Include usage examples

#### Scenario: Display general help
- **WHEN** user runs `memo --help`
- **THEN** list of all commands is displayed
- **AND** general usage information is shown

### Requirement: Note import command
The system SHALL provide command to import notes.
- Support importing single file or directory
- Interactive LLM-assisted topic assignment
- Support skipping notes

#### Scenario: Import directory interactively
- **WHEN** user runs `memo import ./notes/`
- **THEN** each note is processed sequentially
- **AND** LLM suggests topics for each note
- **AND** user can accept, reject, or enter custom topic

#### Scenario: Import with flags
- **WHEN** user runs `memo import ./notes/ --auto`
- **THEN** notes are imported without interaction
- **AND** notes are assigned to "Non classée" topic

### Requirement: Note commands
The system SHALL provide commands for note operations.
- `memo note show <file>` - display note and its topics
- `memo note add <file>` - add a new note
- `memo note topics <file>` - list topics for a note

#### Scenario: Show note details
- **WHEN** user runs `memo note show meeting.md`
- **THEN** note content is displayed
- **AND** note's topics are listed

### Requirement: Topic commands
The system SHALL provide commands for topic operations.
- `memo topic list` - list all topics
- `memo topic show <name>` - show topic details and notes
- `memo topic create <name>` - create new topic
- `memo topic rename <old> <new>` - rename topic
- `memo topic delete <name>` - delete topic
- `memo topic summarize <name>` - generate/regenerate summary
- `memo topic history <name>` - view summary history
- `memo topic propose` - LLM proposes topics from unorganized notes

#### Scenario: List topics with note count
- **WHEN** user runs `memo topic list`
- **THEN** topics are displayed in table format
- **AND** each topic shows number of notes

#### Scenario: Propose topics from notes
- **WHEN** user runs `memo topic propose`
- **THEN** LLM analyzes unorganized notes
- **AND** proposes new topics with descriptions

### Requirement: Sync command
The system SHALL provide command to synchronize files and database.
- Detect external file changes
- Resolve conflicts with user input

#### Scenario: Sync after external edits
- **WHEN** user runs `memo sync`
- **THEN** all note files are scanned
- **AND** changes detected via hash comparison
- **AND** database is updated

### Requirement: Configuration command
The system SHALL provide command to view/set configuration.
- `memo config` - show current config
- `memo config set <key> <value>` - set config value

#### Scenario: View configuration
- **WHEN** user runs `memo config`
- **THEN** current config values are displayed (store path, LLM provider, model)

### Requirement: Output formatting
The system SHALL format output for readability.
- Tables for lists (topics, notes)
- Syntax highlighting for note content
- Clear error messages

#### Scenario: Display topics table
- **WHEN** user runs `memo topic list`
- **THEN** output is formatted as table
- **AND** columns: Name, Notes, Last Updated

### Requirement: Interactive prompts
The system SHALL use interactive prompts for user choices.
- Topic selection during import
- Conflict resolution
- Multi-select where applicable

#### Scenario: Select from suggested topics
- **WHEN** LLM suggests topics for a note
- **THEN** user can select by number
- **AND** can select multiple topics
- **AND** can enter custom topic name

#### Scenario: Resolve sync conflict
- **WHEN** conflict detected between file and DB
- **THEN** user is prompted to choose version
- **AND** can view both versions before choosing