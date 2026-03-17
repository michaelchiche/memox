## ADDED Requirements

### Requirement: LLM provider abstraction
The system SHALL provide an abstract interface for LLM providers.
- Default provider: Ollama (local)
- Swappable implementation for other providers
- Graceful fallback when LLM unavailable

#### Scenario: Use default Ollama provider
- **WHEN** no provider is configured
- **THEN** system uses Ollama provider
- **AND** connects to localhost:11434

#### Scenario: LLM unavailable
- **WHEN** LLM provider is unavailable or fails
- **THEN** system continues with manual operations
- **AND** displays warning that LLM suggestions unavailable

### Requirement: Note classification
The system SHALL use LLM to classify notes into topics.
- Analyze note content
- Match against existing topics with confidence score
- Suggest up to 5 new topic names

#### Scenario: Classify note with existing topics
- **WHEN** LLM analyzes a note
- **AND** existing topics are "Alpha", "Beta", "Gamma"
- **THEN** returns ranked list of matching topics
- **AND** each match includes confidence score (0-100%)
- **AND** returns up to 5 suggested new topic names

#### Scenario: Classify note with no existing topics
- **WHEN** LLM analyzes first note in empty system
- **THEN** returns empty ranked list
- **AND** returns up to 5 suggested new topic names

### Requirement: Topic summary generation
The system SHALL use LLM to generate topic summaries.
- Receive topic context: name, existing summary (if any), notes
- Generate coherent summary of topic
- Support different summary lengths

#### Scenario: Generate summary for topic
- **WHEN** user requests summary generation
- **THEN** LLM receives topic name and all note contents
- **AND** generates summary of topic
- **AND** summary is stored with version

#### Scenario: Generate summary with previous context
- **WHEN** topic has existing summary
- **THEN** LLM receives previous summary
- **AND** generates updated summary incorporating changes

### Requirement: Topic proposal
The system SHALL use LLM to propose new topics from unorganized notes.
- Analyze batch of notes
- Identify common themes
- Propose topic names and descriptions

#### Scenario: Propose topics from notes
- **WHEN** user runs `memo topic propose`
- **THEN** LLM analyzes all notes without topics
- **AND** proposes topic names with descriptions
- **AND** includes sample notes for each proposed topic

### Requirement: LLM request context
The system SHALL provide relevant context to LLM requests.
- Topic names and existing summaries for classification
- Note content (potentially truncated for large notes)
- Previous summary for regeneration

#### Scenario: Context window management
- **WHEN** topic has many notes exceeding context limit
- **THEN** system selects most recent N notes
- **AND** truncates individual notes if still too long
- **AND** warns user about truncation

### Requirement: Provider configuration
The system SHALL allow configuring LLM provider.
- Provider type (Ollama, OpenAI, etc.)
- Model name
- API endpoint / base URL
- API key (for hosted providers)

#### Scenario: Configure Ollama provider
- **WHEN** user specifies Ollama in config
- **THEN** system uses Ollama API
- **AND** connects to specified host (default localhost)

#### Scenario: Configure model
- **WHEN** user specifies model in config
- **THEN** system uses that model for LLM operations