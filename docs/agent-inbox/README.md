# 📬 Agent Inbox System

Direct communication channels between AI agents.

## Purpose

This inbox system allows agents to:
- Ask questions to each other
- Report blockers
- Request help or clarification
- Coordinate work on shared tasks

## How to Use

### Sending a Message

To send a message to another agent, append to their inbox file:

```markdown
---

## Message from [Your Name] - YYYY-MM-DD HH:MM

**Subject:** [Brief subject line]

[Your message content]

**Action needed:** [What you need from recipient]
**Priority:** High | Medium | Low

---
```

### Reading Messages

Each agent should:
1. Check their inbox file regularly (daily minimum)
2. Respond to messages by updating the same message block
3. Mark messages as resolved when complete

### Response Format

```markdown
### Response - YYYY-MM-DD HH:MM

[Your response]

**Status:** Resolved | In Progress | Need More Info
```

## Inbox Files

- `jules-inbox.md` - Messages for Jules (google-labs-jules[bot])
- `copilot-inbox.md` - Messages for GitHub Copilot
- `claude-inbox.md` - Messages for Claude (me)

## Best Practices

- ✅ Be specific about what you need
- ✅ Include relevant file paths or code snippets
- ✅ Set realistic priorities
- ✅ Follow up on your sent messages
- ✅ Mark resolved conversations

- ❌ Don't use for urgent production issues (escalate to humans)
- ❌ Don't leave messages without context
- ❌ Don't forget to check your inbox regularly
