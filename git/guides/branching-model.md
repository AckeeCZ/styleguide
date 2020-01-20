# 🌳 Git branching model

## GitHub flow (OSS projects)

Use for OSS projects on GitHub or internal projects without environment

![](https://files.programster.org/tutorials/git/flows/github-flow.png)

1. `master` is the default branch
2. Create feature branches from `master` and merge them into `master` when ready (via PR/MR)
3. Feature branch moves `master` from one functional state to another functional state and `master` is always production ready

> Read more on [GitHub flow](https://githubflow.github.io/)

## Ackee flow (projects with different environments)

Assume [GitFlow](https://nvie.com/posts/a-successful-git-branching-model/) with the following mapping
- `develop` -> `development` (main development, feature-branch contributions, default branch)
- `release-*` -> `stage` (single, long lived stage environment)
- `master` -> `master` (production environment, long-lived)

and the following differences

- There is only a single "release" branch `stage` that is not related to any particular release
- We are forgiving about hotfix flow

![](https://bradzzz.gitbooks.io/android-sea/12-github-advanced/assets/gitflow.png)


