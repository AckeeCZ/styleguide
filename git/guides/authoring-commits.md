# 👨‍💻 Authoring commits

## User identity

1. Always user your full `name`
2. For GitLab projects, use your Ackee email at `ackee.cz`
3. For GitHub projects, prefer to use your personal email

> ℹ️ You can set your name globally, but leave your email. Then you'll get prompted to provide it for each new project.

## Private and public branches

Feature branches are considered private by default, the author of the branch can force push.

If you want to participate on feature branch of another author, inform them and agree the branch to be public from that point on till merging. Public branches and all other branches, especially the environment branches `development`, `stage`, `production` shall not be force-pushed.

## Commit content

1. **Try to make commits that take the project from one valid state to another.**
   Features are not atomic and abiding this rule might be difficult. Try to divide complex features into incremental changes, prefer dangling unused code (to be integrated later) to compilation error or app start failure.
   Following this rule pays off when doing version rollback or using `git bisect` to detect code breaking changes.

2. **Follow the single responsibility principle.**
   Assume each revision you make to have the possibility to introduce a bug. Wen you and your team identify the commit, following the SRP helps you in various ways. You (A) easily identify the cause of the incorrect behavior, since your commit does nothing else than the changes related to that behavior and (B) if you find out it was not such a great idea, you can `revert` the commit and not have to worry about "the good parts" of the commit you would like to keep and (C) you are more likely to avoid collisions with other collaborators, who might have had the same idea to apply unrelated changes.

## Feature branch history

Try to make history in your feature branch a self-explanatory changelog. It will me more pleasant to review.

Compare reviewing the same feature with this history:

```
✏ Fix typos in readme
💚 Add missing language to travis
👷 Add TravisCI config
Merge branch 'master' into 'feat/foo'
📝 Add simple documentation
🚧 Start writing docs
```

and this:

```
👷 Add TravisCI config
📝 Add simple documentation
```

Usually, minor non-trivial changes, related to introduced changes are not interesting from the scope of a feature branch. Don't destroy your history if it adds value to the project, create merge commit if it requires non-trivial conflict resolution etc. If it does not though, rebase, squash, fixup.
