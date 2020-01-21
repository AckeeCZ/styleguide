# 🔤 Branch naming convention

## Feature branches

For feature branches, use

- `{type}/{issue-id}-{feature-name}` or
- `{type}/{feature-name}` when issue reference is missing.

The issue id is numeral id of Redmine issue or GitHub issue, in case of an OSS which does not use Redmine tracker.

For type use type from [conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/#summary):

- `fix`
- `feat`
- `chore`
- `docs`
- `style`
- `refactor`
- `perf`
- `test`,

Examples:

- `feat/123-add-foo`
- `fix/550-add-missing-id`

## Other branches

[Git branching flow](./branching-model.md) defines names of all long-lived branches
