## Context

The `memo` CLI currently lacks a dedicated initialization command. Users must either:
1. Manually create `.memorc.yaml` or `memo.yaml` files
2. Rely on implicit defaults when running commands like `sync`

This creates friction for new users who don't know what configuration options exist or where files are stored.

The existing `sync` command creates directories and initializes the database implicitly, but doesn't provide user feedback or configuration guidance.

## Goals / Non-Goals

**Goals:**
- Provide a clear entry point for new users
- Create config file with sensible defaults
- Initialize directory structure and database
- Offer optional customization flow
- Support both local (`./memo.yaml`) and global (`~/.memorc.yaml`) configurations

**Non-Goals:**
- Detect or verify Ollama availability
- Migrate existing configurations
- Support other LLM providers beyond Ollama/OpenAI (already supported)
- Advanced configuration validation

## Decisions

### D1: Default to local config

**Decision:** `memo init` creates `./memo.yaml` (visible) by default. Use `--global` flag for `~/.memorc.yaml` (hidden).

**Rationale:** 
- Local config is project-scoped, more discoverable
- Visible `memo.yaml` is easier to find and edit
- Global config already exists as fallback; local enables per-project customization

**Alternatives considered:**
- Global by default: Less discoverable, conflicts with "project" mental model
- Prompt for scope: Adds friction for common case (local project setup)

### D2: Hybrid UX flow

**Decision:** Show defaults, prompt once "Customize? [y/N]", only enter interactive mode if user accepts.

**Rationale:**
- Fast for users who accept defaults (most cases)
- Flexibility for users who want customization
- Consistent with patterns like `npm init` (minimal by default)

**Alternatives considered:**
- Fully non-interactive: Less helpful for new users
- Full wizard: Too slow for power users

### D3: Initialize everything in one command

**Decision:** `init` creates config, directories, and database in one go.

**Rationale:**
- Matches user expectation of "initialization" = ready to use
- Reduces friction compared to separate steps
- Same behavior as current implicit initialization in `sync`

### D4: File existence handling

**Decision:** If config file exists, prompt for overwrite with clear message.

**Rationale:**
- Prevents accidental data loss
- User-friendly for iterative config updates
## Risks / Trade-offs

**Risk: Config file permissions**
→ Mitigation: Use standard file permissions (user read/write), same as existing behavior

**Risk: Database creation fails**
→ Mitigation: Wrapping in try/catch, rolling back config file if DB init fails

**Trade-off: No validation of LLM provider**
→ Accepted: Connection validation would require network calls, slowing init. Users discover issues when running actual LLM commands.

## Open Questions

None - design is complete for implementation.