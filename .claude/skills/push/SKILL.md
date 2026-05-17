---
name: push
description: Use this skill when the user says "/push" or "push". Pushes the current branch to origin.
argument-hint: Optional remote or branch name
---

# Push Skill

Push the current branch to origin.

## Steps

1. `git branch --show-current` — confirm current branch
2. `git push origin <branch>`
3. Report success or surface any errors
