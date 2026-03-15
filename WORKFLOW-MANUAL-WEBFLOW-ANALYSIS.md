# Workflow: Manual Webflow Changes

This project uses an analysis-first workflow for Webflow.

## Agreement

- The assistant analyzes the Webflow project and repository files.
- The assistant identifies issues, risks, and improvement opportunities.
- The user applies all final changes in Webflow manually.

## What the assistant can do

- Inspect local project files and explain behavior.
- Inspect Webflow data/structure to find root causes.
- Suggest concrete step-by-step fixes for manual implementation.
- Provide verification checklists and regression checks.

## What the assistant should not do by default

- No direct write actions in the live Webflow project.
- No automatic visual/layout edits in Designer.
- No publication actions unless explicitly requested.

## Recommended execution format

1. Confirm scope and page/feature under review.
2. Analyze current behavior and identify root cause.
3. Propose prioritized manual fixes with expected impact.
4. Provide a concise QA checklist for post-change validation.

## Override rule

If direct edits are needed, a separate explicit request is required for that specific task.
