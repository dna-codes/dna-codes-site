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
  - Bash(npm run check:*)
  - Bash(npm run check)
  - Bash(npm run fix:*)
  - Bash(npm run fix)
---

# Commit-Push Skill

Stage, commit, and push to origin in a single workflow. Combines the `/commit` and `/push` skills, with a lint gate before the commit lands.

## Steps

### Phase 1 — Commit

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
   - Do NOT push or commit while `npm run check` is failing. Do NOT use `--no-verify` to bypass — this triggers a deploy and broken code shouldn't ship.

3. Draft a commit message following the repo's style (conventional commits, under 72 chars, focused on _why_).

4. Stage and commit in a single tool call:
   - Stage relevant files (prefer specific files over `git add -A`) — include any files modified by `npm run fix` or your manual lint fixes
   - Commit with the drafted message, appending:
     ```
     Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
     ```
   - Pass message via HEREDOC

5. If the pre-commit hook (Prettier auto-format) modifies files, those changes are auto-staged by the hook and a new commit is needed only if the commit itself failed. Do NOT amend; create a NEW commit if anything is missing.

### Phase 2 — Push

6. Push to origin:

   ```bash
   git push origin main
   ```

7. Report:
   - Show the commit hash and message (mention any lint fixes rolled in)
   - Confirm the push succeeded
   - Tell the user GitHub Actions has been triggered and the site will deploy to GitHub Pages once the workflow passes

## Notes

- A pre-commit hook auto-formats staged files with Prettier, but it does NOT run `astro check` or ESLint. This skill runs `npm run check` explicitly so a deploy never ships broken types or lint errors.
- Do not commit `.env` files or files that may contain secrets.
- If there are no changes to commit, skip Phase 1 and just push (deploy only).
- Do not force-push.
