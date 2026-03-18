# Plan: Add Step Numbers to Import Progress

**Target Change:** `add-import-progress-ui` (enhancement to completed change)

---

## Summary

Add step numbers `(X/Y)` to progress messages during file import, showing progress within each file's processing steps.

---

## Requirements

| Req | Description |
|-----|-------------|
| R1 | Show step number and total in format `(X/Y)` on spinner messages |
| R2 | "Discovering" phase shows **no** step count (one-time setup) |
| R3 | "Done" is **not** counted in total steps |
| R4 | Step count varies by context (file type, mode, LLM availability) |

---

## Step Counts by Context

| Mode | File Type | LLM | Steps | Total |
|------|-----------|-----|-------|-------|
| `--auto` | Any | N/A | reading | 1 |
| `--default` | .md | No | reading, finalizing | 2 |
| `--default` | .txt | Yes | reading, summarizing, finalizing | 3 |
| `--default` | .txt | No | reading, finalizing | 2 |
| Interactive | .md | Yes | reading, classifying, finalizing | 3 |
| Interactive | .md | No | reading, finalizing | 2 |
| Interactive | .txt | Yes | reading, summarizing, classifying, finalizing | 4 |
| Interactive | .txt | No | reading, finalizing | 2 |

---

## Implementation

### File: `src/commands/import.ts`

#### 1. Add helper function to calculate total steps

```typescript
function getTotalSteps(
  isTxtFile: boolean,
  llmAvailable: boolean,
  mode: 'auto' | 'default' | 'interactive'
): number {
  if (mode === 'auto') return 1;
  
  let steps = 2; // reading + finalizing (always present)
  
  if (isTxtFile && llmAvailable) {
    steps += 1; // summarizing
  }
  
  if (mode === 'interactive' && llmAvailable) {
    steps += 1; // classifying
  }
  
  return steps;
}
```

#### 2. Modify `getStepMessage` to include step numbers

```typescript
function getStepMessage(
  step: ImportStep,
  filename: string,
  currentStep: number,
  totalSteps: number
): string {
  const stepLabels: Record<ImportStep, string> = {
    discovering: "Discovering files...",
    reading: `Reading ${filename}`,
    parsing: `Parsing ${filename}`,
    hashing: `Hashing ${filename}`,
    summarizing: `Summarizing ${filename}`,
    classifying: `Classifying ${filename}`,
    finalizing: `Finalizing ${filename}`,
    done: `Completed ${filename}`,
  };
  
  // Don't show step count for discovering or done
  if (step === 'discovering' || step === 'done') {
    return stepLabels[step];
  }
  
  return `${stepLabels[step]} (${currentStep}/${totalSteps})`;
}
```

#### 3. Track step counter in import loop

Add step counter variables before the file loop:

```typescript
let currentStep = 0;
const mode: 'auto' | 'default' | 'interactive' = 
  options.auto ? 'auto' : (options.default ? 'default' : 'interactive');
```

#### 4. Update step calls with counter

Before each step message, increment and pass counter:

```typescript
// Reset counter for each file
currentStep = 0;

// Reading step
const totalSteps = getTotalSteps(isTxtFile, llmAvailable, mode);
currentStep++;
s.message(getStepMessage('reading', relativePath, currentStep, totalSteps));

// Summarizing step (if applicable)
if (isTxtFile && llmAvailable) {
  currentStep++;
  s.message(getStepMessage('summarizing', relativePath, currentStep, totalSteps));
}

// Classifying step (if applicable)
if (mode === 'interactive' && llmAvailable) {
  currentStep++;
  s.message(getStepMessage('classifying', relativePath, currentStep, totalSteps));
}

// Finalizing step
currentStep++;
s.message(getStepMessage('finalizing', relativePath, currentStep, totalSteps));
```

---

## Example Output

```
◈ Importing notes

◐ Reading notes/project.md (1/2)
◐ Finalizing notes/project.md (2/2)
✓ notes/project.md

◐ Reading notes/alpha.txt (1/3)
◐ Summarizing notes/alpha.txt (2/3)
◐ Finalizing notes/alpha.txt (3/3)
✓ notes/alpha.txt
```

---

## Tasks

- [ ] Add `getTotalSteps()` helper function
- [ ] Update `getStepMessage()` signature to accept step numbers
- [ ] Add conditional formatting (with/without step count)
- [ ] Add step counter tracking in `importNotes()`
- [ ] Update all `s.message()` calls to pass step numbers
- [ ] Build and test

---

## Affected Code

| File | Change |
|------|--------|
| `src/commands/import.ts` | Add step counting logic |

---

## Ready for Implementation

After plan approval, the implementer should:
1. Update `getTotalSteps()` helper
2. Modify `getStepMessage()` function
3. Add counter variables and increment calls
4. Test with different modes and file types