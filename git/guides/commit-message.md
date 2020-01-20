# 💬 Commit message convention

## Recommendation

1. Use [Gitmoji](https://gitmoji.carloscuesta.me/)
   - Use single emoji, use unicode (🐛, not `:bug:`), seperate with single space from message
   - Use only valid Gitmojis and respect the semantics to your best judgement and knowledge (if multiple apply, select the more specific)
2. Write message titles according to [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
   - Briefly and precisely describe what/how/why, add detail to body if required
   - Blank lines to separate description/body/trailers, 50/72 lengths
   - Capitalize message, use imperative, omit trailing dot
3. Reference RM issue in body as `#12345`
   - If you need to reference GH and RM, use `#GH-123` to avoid collision (does not break either integration)
   - You can use [git trailers](https://git.wiki.kernel.org/index.php/CommitMessageConventions)
4. Leave default messages on `merge`, `cherry-pick` and `revert`

Example:

```
🐛 Add logger lazy load to fix user defined logger

Defaut was always used, because logger was exported as a value after
initialization with default config

Related: #38262
```

## Additional info

### Issue tracker

Following the feature branch naming convention, you can use [tracker-hook](https://github.com/grissius/tracker-hook) to mark your commits with an issue tracker number automatically.

### Why Gitmoji

- Enjoyable, readable and expressive
- It's not just random emojis. It's semantic tagging like conventional commits, but with different presentation layer.

### Gitmoji CLI

```bash
# do once
npm i -g gitmoji-cli # install CLI
gitmoji -g # global config wizard - setup unicode

# per repo
gitmoji -i # setup hook in current git repo (prepare-commit-msg hook)
```

- Interactive CLI wizard gets triggered on git commit
- If you want to keep message unchanged (e.g. amending), just interrupt
