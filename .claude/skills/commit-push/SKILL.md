---
name: commit-push
description: Use this skill when the user says "/commit-push", "commit and push", "save and ship", "commit and push", or "commit then deploy". Stages, commits, and pushes to origin in one step — then watches the GitHub Actions build and the Deploy to GitHub Pages workflow through to completion, confirming the deploy succeeded.
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
  - Bash(gh run watch:*)
  - Bash(gh run view:*)
  - Bash(gh api:*)
  - Bash(npm run check:*)
  - Bash(npm run check)
  - Bash(npm run fix:*)
  - Bash(npm run fix)
---

# Commit-Push Skill

Stage, commit, and push to origin in a single workflow, then watch the build and deploy through to completion. Combines the `/commit` and `/push` skills, with a lint gate before the commit lands and a deploy-verification gate after. The skill is not done until the site has deployed (or you've reported a concrete failure).

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

7. Confirm the push succeeded and note the commit hash + message (mention any lint fixes rolled in). Do NOT report final success yet — the deploy still has to pass. Continue to Phase 3.

### Phase 3 — Verify the deploy

The point of this skill is shipping, not just pushing. A green push that fails to deploy is a failure. Always watch both workflows through to completion before reporting back.

8. Find the **GitHub Actions** run for the commit you just pushed and watch it to completion:

   ```bash
   gh run list --branch main --limit 5
   gh run watch <run-id> --exit-status
   gh run view <run-id> --json status,conclusion,jobs -q '.status, .conclusion, (.jobs[] | "\(.name): \(.conclusion)")'
   ```

   - Match the run to your commit by title/SHA — don't watch a stale run.
   - If the build or check job fails, the deploy will be skipped. Pull the logs (`gh run view <run-id> --log-failed`), fix the cause, and re-run the whole skill (new commit). Do not stop at a red build.

9. Once GitHub Actions is green, the **Deploy to GitHub Pages** workflow fires via `workflow_run`. Watch it too:

   ```bash
   gh run list --workflow "Deploy to GitHub Pages" --limit 3
   gh run watch <deploy-run-id> --exit-status
   gh run view <deploy-run-id> --json status,conclusion,jobs -q '.status, .conclusion, (.jobs[] | "\(.name): \(.conclusion)")'
   ```

   - It may take a few seconds to appear after the build goes green — list again if it's not there yet.
   - A `skipped` Deploy conclusion means the upstream build did not succeed — treat it as a failure and investigate.

10. Final report only after the deploy is confirmed:
    - Commit hash + message
    - GitHub Actions result (per-job)
    - Deploy result, and the live URL (`gh api repos/dna-codes/dna-codes-site/pages -q '.html_url'`)
    - If anything failed, say so plainly with the failing job and next step — never imply success when the deploy is red or skipped.

## Notes

- A pre-commit hook auto-formats staged files with Prettier, but it does NOT run `astro check` or ESLint. This skill runs `npm run check` explicitly so a deploy never ships broken types or lint errors.
- Do not commit `.env` files or files that may contain secrets.
- If there are no changes to commit, skip Phase 1 and just push (deploy only).
- Do not force-push.
