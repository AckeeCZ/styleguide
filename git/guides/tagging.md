# 🏷️ Tag naming convention

## Version tags

For version tags, use semantic versioning with `v` prefix:

- `v{major}.{minor}.{patch}` for releases
- `v{major}.{minor}.{patch}-{prerelease}` for pre-releases

The version follows [Semantic Versioning 2.0.0](https://semver.org/) specification:

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

Examples:

- `v1.0.0`
- `v2.3.1`
- `v1.0.0-alpha`
- `v1.0.0-beta.1`
- `v2.0.0-rc.1`

## Creating tags

### Annotated tags

Always use annotated tags for releases (contains metadata):

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### Lightweight tags

Use lightweight tags for temporary markers only:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## When to tag

- Tag stable releases on `master`/`main` branch
- Tag after merging release branch
- Tag before deploying to production

## Additional info

## Real-world examples

Major open-source projects using v-prefix:

- [Linux kernel](https://github.com/torvalds/linux/tags): `v6.8`, `v6.7`, `v6.6`
- [TypeScript](https://github.com/microsoft/TypeScript/tags): `v5.3.3`, `v5.3.2`, `v5.3.1`
- [Node.js](https://github.com/nodejs/node/tags): `v21.6.0`, `v21.5.0`, `v20.11.0`

### Further reading

- [Git Basics - Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
- [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- [Semantic Versioning](https://semver.org/)
