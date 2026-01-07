# 📊 Agent Status System

Real-time status tracking for all AI agents.

## Purpose

Status files provide visibility into:
- What each agent is currently working on
- When they last checked in
- Their current workload
- Any blockers or issues

## Status File Format

Each agent maintains a JSON file:

```json
{
  "agent": "Agent Name",
  "last_updated": "2026-01-07T14:30:00Z",
  "status": "active | idle | blocked",
  "current_tasks": [
    {
      "task_id": "TASK-001",
      "title": "Task title",
      "status": "IN_PROGRESS",
      "started": "2026-01-07T10:00:00Z",
      "progress": "50%",
      "notes": "Optional progress notes"
    }
  ],
  "completed_today": 2,
  "blockers": [
    {
      "task_id": "TASK-XXX",
      "issue": "Brief description",
      "severity": "high | medium | low"
    }
  ],
  "next_check_in": "2026-01-07T16:00:00Z"
}
```

## How to Update

Agents should update their status file:
- When starting a new task
- At least once per work session
- When completing a task
- When encountering a blocker
- Before going offline

## For Humans

These status files provide a dashboard view of all agent activity. Check here to see:
- Who's working on what
- Progress of active tasks
- Any blockers that need attention
