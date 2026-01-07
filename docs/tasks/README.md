# 📋 Agent Task Queue

This directory contains task assignments for AI agents working on the CodeMentor AI project.

## How It Works

### For AI Agents
1. **Check this folder** for files matching your name (e.g., `TASK-XXX-jules-*.md`)
2. **Find TODO tasks** with `Status: TODO`
3. **Claim task** by updating status to `IN_PROGRESS`
4. **Work on implementation** according to specifications
5. **Update progress** regularly by committing status changes
6. **Create PR** when complete
7. **Link PR** in task file and update status to `DONE`

### Task File Naming
- Format: `TASK-{number}-{agent}-{short-description}.md`
- Examples:
  - `TASK-001-jules-stripe-integration.md`
  - `TASK-002-copilot-ui-components.md`
  - `TASK-003-claude-documentation.md`

### Task Statuses
- **TODO**: Task is ready to be claimed
- **IN_PROGRESS**: Agent is actively working
- **BLOCKED**: Agent needs help or waiting for dependency
- **DONE**: Task completed, PR merged

### Priority Levels
- **High**: Critical path, work on this first
- **Medium**: Important but not blocking
- **Low**: Nice to have, work on when time permits

## For Humans

This system provides full visibility into:
- What each agent is working on
- Progress of all tasks
- Blocking issues that need attention
- Complete history via Git commits

You can create new tasks by adding files to this directory following the template below.

## Task Template

```markdown
# Task: [Title]

**ID:** TASK-XXX
**Assigned to:** Jules | Copilot | Claude
**Status:** TODO | IN_PROGRESS | BLOCKED | DONE
**Priority:** High | Medium | Low
**Created:** YYYY-MM-DD
**Due:** YYYY-MM-DD (optional)

## Description
[Detailed description of what needs to be done]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Details
[Implementation guidance, architecture decisions, code patterns to follow]

## Dependencies
- **Requires:** TASK-XXX (must be completed first)
- **Blocks:** TASK-YYY (this task blocks another)

## Testing Requirements
- Unit tests required: Yes/No
- Integration tests: Yes/No
- Coverage target: X%

## Related Files
- `path/to/relevant/file1.js`
- `path/to/relevant/file2.py`

## Status Updates
- YYYY-MM-DD HH:MM: Task created by [Agent/Human]
- YYYY-MM-DD HH:MM: Started work (Jules)
- YYYY-MM-DD HH:MM: Progress update - [status description]
- YYYY-MM-DD HH:MM: PR created: #XX
- YYYY-MM-DD HH:MM: Task completed
```
