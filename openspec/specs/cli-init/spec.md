## ADDED Requirements

### Requirement: Init command creates local config file

The system SHALL provide a `memo init` command that creates a configuration file at `./memo.yaml` in the current working directory.

#### Scenario: First-time local initialization
- **WHEN** user runs `memo init` in a directory without existing config
- **THEN** the system creates `./memo.yaml` with default configuration values
- **AND** the system creates the store directory if it does not exist
- **AND** the system initializes the SQLite database

#### Scenario: Config file already exists locally
- **WHEN** user runs `memo init` and `./memo.yaml` already exists
- **THEN** the system prompts "Config file already exists at ./memo.yaml. Overwrite? [y/N]"
- **AND** if user confirms, the system overwrites the existing file
- **AND** if user declines, the system exits without changes

### Requirement: Init command supports global configuration

The system SHALL support a `--global` flag that creates configuration at `~/.memorc.yaml`.

#### Scenario: Global initialization
- **WHEN** user runs `memo init --global`
- **THEN** the system creates `~/.memorc.yaml` with default configuration values
- **AND** the system creates the store directory and initializes the database

#### Scenario: Global config already exists
- **WHEN** user runs `memo init --global` and `~/.memorc.yaml` already exists
- **THEN** the system prompts for overwrite confirmation

### Requirement: Init displays defaults and offers customization

The system SHALL display default configuration values and prompt the user to optionally customize them.

#### Scenario: User accepts defaults
- **WHEN** user runs `memo init`
- **THEN** the system displays default values for: storePath, LLM provider, LLM model, defaultTopic
- **AND** the system prompts "Customize defaults? [y/N]"
- **AND** if user enters "N" or presses Enter, the system proceeds with defaults

#### Scenario: User customizes configuration
- **WHEN** user runs `memo init` and enters "y" at the customize prompt
- **THEN** the system prompts for each configuration value with current default as placeholder
- **AND** prompts include: store path, LLM provider, LLM model, default topic
- **AND** user can accept default by pressing Enter or enter custom value
- **AND** the system saves customized values to the config file

### Requirement: Init reports success with summary

The system SHALL report successful initialization with a summary of created resources.

#### Scenario: Successful initialization
- **WHEN** initialization completes successfully
- **THEN** the system outputs the config file path created
- **AND** the system outputs the store path and database path
- **AND** the system outputs a suggestion to run `memo import` or `memo sync`

#### Scenario: Initialization failure
- **WHEN** initialization fails (e.g., permission error, disk full)
- **THEN** the system outputs an error message
- **AND** the system exits with non-zero status code
- **AND** any partially created resources are cleaned up if possible

### Requirement: Init uses existing configuration utilities

The system SHALL reuse existing configuration functions from `src/lib/config.ts` for consistency with other commands.

#### Scenario: Config file generation
- **WHEN** creating configuration file
- **THEN** the system uses `saveConfigToFile` from `src/lib/config.ts`
- **AND** the system uses `getDefaultConfig` for default values
- **AND** the config format matches existing YAML structure