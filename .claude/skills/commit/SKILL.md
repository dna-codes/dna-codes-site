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
  - Bash(npm run check:*)
  - Bash(npm run check)
  - Bash(npm run fix:*)
  - Bash(npm run fix)
---

# Commit Skill

Stage and commit all current changes with an appropriate message — but only after lint checks pass.

## Steps

1. Gather context:
   - `git status` — see what's changed
   - `git diff HEAD` — see the actual changes
   - `git log --oneline -10` — learn the repo's commit message style
   - `git branch --show-current` — confirm current branch

2. Run lint checks and address any issues:
   - Run `npm run check` (astro check + ESLint + Prettier).
   - If it fails:
     - First try `npm run fix` to auto-fix ESLint + Prettier issues, then re-run `npm run check`.
     - For anything still failing (typically `astro check` type errors or ESLint errors with no auto-fix), read the affected files and fix the issues directly.
     - Re-run `npm run check` until it passes.
   - Do NOT commit while `npm run check` is failing. Do NOT use `--no-verify` to bypass.

3. Draft a commit message:
   - Follow the style of recent commits (conventional commits if the repo uses them)
   - Keep the subject line under 72 characters
   - Focus on the _why_, not the _what_
   - Do NOT commit `.env` files or files that may contain secrets

4. Stage and commit in a single tool call:
   - Stage with `git add` (prefer specific files over `git add -A` unless all changes belong together) — include any files modified by `npm run fix` or your manual lint fixes
   - Commit with the drafted message, appending:
     ```
     Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
     ```
   - Pass the message via a HEREDOC to preserve formatting

5. Report the result: show the commit hash and message. Mention any lint fixes that were rolled into the commit.

## Notes

- A pre-commit hook auto-formats staged files with Prettier (`prettier --write`), but it does NOT run `astro check` or ESLint — that's why this skill runs `npm run check` explicitly before committing.
- If there are no staged or unstaged changes, tell the user there is nothing to commit.
- Do not push. Use `/push` or `/commit-push` if a push is also needed.
