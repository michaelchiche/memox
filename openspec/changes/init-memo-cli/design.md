## Context

`memo` is a new CLI application for personal note organization. Users have scattered markdown files and need intelligent reorganization. The app bridges a SQLite database with markdown files, using LLM (Ollama) to suggest topic classifications and generate summaries.

Key constraints:
- Local-first (no cloud dependency for core functionality)
- Works with standard markdown files (frontmatter YAML for metadata)
- LLM is a suggestion engine - user validates all decisions
- Personal use case (single-user, no auth required)

## Goals / Non-Goals

**Goals:**
- Provide CLI commands for importing, organizing, and viewing notes grouped by topics
- Use LLM to suggest topic assignments during import
- Generate topic summaries via LLM with manual regeneration capability
- Maintain bidirectional sync between DB and markdown frontmatter
- Support notes belonging to multiple topics (N:N)
- Version topic summaries for historical tracking

**Non-Goals:**
- Multi-user support or authentication
- Real-time collaboration
- Cloud sync or remote storage
- Mobile or web UI (CLI-first)
- Automatic topic assignment without user confirmation

## Decisions

### D1: Technology Stack

**Decision:** TypeScript with Node.js, SQLite with FTS5, Ollama for LLM.

**Rationale:**
- TypeScript: Type safety for complex domain logic, good CLI ecosystem
- SQLite: Zero-config local DB, FTS5 for full-text search, sufficient for personal use
- Ollama: Local LLM inference, no API costs, privacy-preserving

**Alternatives considered:**
- Go/Rust: Better for compiled CLI, but TypeScript ecosystem richer for rapid iteration
- PostgreSQL: Overkill for single-user local app
- OpenAI API: External dependency, cost, privacy concerns

### D2: Data Model - No Tags, Direct Topic Assignment

**Decision:** Notes assigned directly to topics (N:N). No intermediate tag layer.

**Rationale:**
- Simpler mental model for users
- LLM can classify directly into topics
- Tags add indirection without clear benefit for this use case
- Topics provide both organization AND aggregation for summaries

**Alternatives considered:**
- Tags + Topics: More flexible but adds complexity (one more layer to manage)
- Hierarchical topics: Adds nesting complexity early on

### D3: Bidirectional Sync Strategy

**Decision:** DB is source of truth, but frontmatter is always updated to match. Conflict resolution by hash comparison.

**Rationale:**
- DB enables efficient queries and relationships
- Frontmatter keeps files portable and human-readable
- Hash-based conflict detection catches external edits

**Sync flow:**
1. On read: Compare file hash to DB hash
2. If different: File was edited externally → parse frontmatter, merge with DB
3. On write: Update DB, write file with updated frontmatter

**Conflict strategy:** If both DB and file changed, prompt user to choose resolution.

### D4: LLM Provider Abstraction

**Decision:** Interface-based `LLMProvider` with Ollama default, swappable implementation.

**Rationale:**
- Enables future support for OpenAI, Anthropic, local models
- Easy testing with mock provider
- Clean separation of concerns

**Interface operations:**
- `classifyNote(note: Note, existingTopics: Topic[]): { rankedTopics: TopicMatch[], suggestedNewTopics: string[] }`
- `summarizeTopic(topic: Topic, notes: Note[]): string`
- `proposeTopics(notes: Note[]): TopicProposal[]`

### D5: Import Workflow - Interactive with LLM Suggestions

**Decision:** Interactive import where LLM suggests topic assignments and user confirms each.

**Rationale:**
- LLM is fallible - explicit confirmation prevents misclassification
- User can correct or provide manual input
- Builds user understanding of topic structure

**Workflow:**
1. LLM analyzes note content
2. Returns ranked existing topics + suggested new topics
3. User selects: accept existing, create new, or enter manually
4. Default to "Non classée" if skipped

### D6: Summary Versioning

**Decision:** Store all summary versions in a separate table with timestamps.

**Rationale:**
- Enables viewing topic evolution over time
- No data loss on regeneration
- Light storage impact (summaries are small)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| LLM unavailable or slow | Graceful degradation: manual topic assignment works without LLM |
| Ollama model not installed | Detect on startup, show setup instructions |
| Sync conflicts between DB and files | Hash comparison + user prompt for resolution |
| Large note collections slow import | Batch processing, progress indicators |
| Topic names in frontmatter diverge from DB | Sync on every operation, hash verification |
| Summary generation uses many tokens | Limit context window, summarize only on demand |

## Migration Plan

N/A - New application, no migration required.

## Open Questions

1. **Topic name constraints:** Allow spaces? Special characters? Unicode? (Initial thought: allow any, sanitize for file system)
2. **Batch import performance:** At what scale does interactive import become unwieldy? (May need auto-accept threshold for high-confidence matches)
3. **Summary prompt tuning:** What context is optimal for generating useful summaries? (Iterate based on usage)