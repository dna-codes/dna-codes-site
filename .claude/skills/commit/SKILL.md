---
name: commit
description: Use this skill when the user says "/commit", "commit my changes", "create a commit", "make a commit", or "commit this". Stages and commits all current changes with a generated commit message that matches the repo's style.
argument-hint: Optional commit message or scope hint
allowed-tools:
  - Bash(git add:*)
  - Bash(git status:*)
  - Bash(git diff:*)
  - Bash(git log:*)
  - Bash(git commit:*)
  - Bash(git branch:*)
---

# Commit Skill

Stage and commit all current changes with an appropriate message.

## Steps

1. Gather context:
   - `git status` — see what's changed
   - `git diff HEAD` — see the actual changes
   - `git log --oneline -10` — learn the repo's commit message style
   - `git branch --show-current` — confirm current branch

2. Draft a commit message:
   - Follow the style of recent commits (conventional commits if the repo uses them)
   - Keep the subject line under 72 characters
   - Focus on the _why_, not the _what_
   - Do NOT commit `.env` files or files that may contain secrets

3. Stage and commit in a single tool call:
   - Stage with `git add` (prefer specific files over `git add -A` unless all changes belong together)
   - Commit with the drafted message, appending:
     ```
     Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
     ```
   - Pass the message via a HEREDOC to preserve formatting

4. Report the result: show the commit hash and message.

## Notes

- A pre-commit hook runs `npm run check` automatically before the commit lands. If it fails, fix the reported issues and retry — do NOT use `--no-verify`.
- If there are no staged or unstaged changes, tell the user there is nothing to commit.
- Do not push. Use `/deploy` or `/commit-deploy` if a push is also needed.
