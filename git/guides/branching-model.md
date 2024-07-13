# 🌳 Git branching model

We use two different unrelated flows depending on the type of the project

1. **GitHub flow** - use for all OSS projects, "library like" projects and trivial projects without running different project environments
2. **Ackee flow** - use for projects that require independent environment development (most projects)

## GitHub flow

Use for OSS projects on GitHub or internal projects without environment

![](https://files.programster.org/tutorials/git/flows/github-flow.png)

1. `master` is the default branch
2. Create feature branches from `master` and merge them into `master` when ready (via PR/MR)
3. Feature branch moves `master` from one functional state to another functional state and `master` is always production ready

> 📝 Read more on [GitHub flow](https://githubflow.github.io/)

## Ackee flow

- `development`
  - the main development branch (set as project's default branch)
  - merges from feature branches
  - represents current version of the "nightly builds"
  - if multiple versions are being developed at the same time (mainly on mobile apps) multiple `development` branches may exist with the version suffix corresponding to [semantic versioning](https://semver.org/), eg. `development-1.2.0`.
- `stage`
  - "pre-production" branch
  - merges only from `development`
  - represents current version of "beta", stable testing version
- `master`
  - merges only from `stage`
  - represents current production version

> ⚠️ Feature branches should be deleted once related PR/MR is merged (keep the repository clean)

![](http://www.plantuml.com/plantuml/svg/ZP2x3i8m34NtV8K_e4Y8aG7rCJCpC5cDqqOq3pak_Nr20IbTKDTxJuvrKoT1bjbDAZsiZyZe88semsBz00QdH4MpCCQRrJB2wQXKpiJsDg8NqFIaAKH7NZPvrW-qIHmc8LRgVhYKhyvm9Hu8WW53A3CJD3kOLXKzP7mz-0ER2bemWK4eIHwqGzZz5NORsrgzcS-cychrHIC7FVTYWrSrUPq_-WK0)

### Coming from GitLab flow?

Assume GitLab flow with:

- `master` -> `development` rename
- `stage` and `master` environment branches
- merging flow `development -> stage -> master`

> 📝 Read more on [GitLab flow](https://about.gitlab.com/blog/2014/09/29/gitlab-flow/)

### Coming from GitFlow?

Assume GitFlow with the following mapping

- `develop` -> `development` (main development, feature-branch contributions, default branch)
- `release-*` -> `stage` (single, long lived stage environment)
- `master` -> `master` (production environment, long-lived)

and the following differences

- There is only a single "release" branch `stage` that is not related to any particular release
- We are forgiving about hotfix flow

> 📝 Read more on [GitFlow](https://nvie.com/posts/a-successful-git-branching-model/)
