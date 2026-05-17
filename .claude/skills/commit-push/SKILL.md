---
name: commit-push
description: Use this skill when the user says "/commit-push", "commit and push", "save and ship", "commit and push", or "commit then deploy". Stages, commits, and pushes to origin in one step — triggering the GitHub Actions build and deploy to GitHub Pages.
argument-hint: Optional commit message or scope hint
allowed-tools:
  - Bash(git add:*)
  - Bash(git status:*)
  - Bash(git diff:*)
  - Bash(git log:*)
  - Bash(git commit:*)
  - Bash(git branch:*)
  - Bash(git push:*)
  - Bash(gh run list:*)
---

# Commit-Deploy Skill

Stage, commit, and push to origin in a single workflow. Combines the `/commit` and `/push` skills.

## Steps

### Phase 1 — Commit

1. Gather context:
   - `git status` — see what's changed
   - `git diff HEAD` — see the actual changes
   - `git log --oneline -10` — learn the repo's commit message style
   - `git branch --show-current` — confirm current branch

2. Draft a commit message following the repo's style (conventional commits, under 72 chars, focused on _why_).

3. Stage and commit in a single tool call:
   - Stage relevant files (prefer specific files over `git add -A`)
   - Commit with the drafted message, appending:
     ```
     Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
     ```
   - Pass message via HEREDOC

4. If the pre-commit hook (`npm run check`) fails: fix the reported issues, then re-stage and create a NEW commit — do NOT use `--no-verify` and do NOT amend.

### Phase 2 — Deploy

5. Push to origin:

   ```bash
   git push origin main
   ```

6. Report:
   - Show the commit hash and message
   - Confirm the push succeeded
   - Tell the user GitHub Actions has been triggered and the site will deploy to GitHub Pages once the workflow passes

## Notes

- Do not commit `.env` files or files that may contain secrets.
- If there are no changes to commit, skip Phase 1 and just push (deploy only).
- Do not force-push.
