# 🔧 Tooling & conventions

## TypeScript

`strict: true`, always. Beyond that, the settings that matter:

```jsonc
{
    "compilerOptions": {
        "strict": true,
        "baseUrl": "src",
        "paths": { "~*": ["*"] },
        "isolatedModules": true,
        "verbatimModuleSyntax": true,
        "forceConsistentCasingInFileNames": true,
        "moduleResolution": "Bundler",
        "noEmit": true
    }
}
```

`verbatimModuleSyntax` forces type-only imports to say so, which keeps them out of the bundle:

```typescript
// BAD
import { UserDto } from '~modules/api';

// GOOD
import type { UserDto } from '~modules/api';

// GOOD - mixed
import { useGetApiV1Users, type UserDto } from '~modules/api';
```

`forceConsistentCasingInFileNames` matters more than it looks: macOS is case-insensitive, CI is not,
and a mis-cased import passes locally and fails the build.

**Never use `any`.** Use `unknown` and narrow, or write the type. The one acceptable place is a
generated-code boundary, with a comment explaining why. Type assertions (`as`) are a last resort —
each one is a promise the compiler stops checking.

General naming and typing rules (`is`/`has` booleans, `Error` suffix, `T`-prefixed generics,
`type` vs `interface`) are shared with the backend: see
[Backend coding guide](../../backend/guides/code.md#typescript).

## Prettier

Formatting is not discussed, it is configured:

```javascript
const config = {
    singleQuote: true,
    jsxSingleQuote: true,
    semi: true,
    arrowParens: 'avoid',
    printWidth: 120,
    tabWidth: 4,
    trailingComma: 'all',
    plugins: [require.resolve('@ianvs/prettier-plugin-sort-imports')],
};
```

### Import order is enforced

`@ianvs/prettier-plugin-sort-imports` groups imports with a blank line between groups:

```javascript
importOrder: generateImportOrder([
    ['^(react/(.*)$)|^(react$)|^(react-native(.*)$)', '<BUILTIN_MODULES>', '<THIRD_PARTY_MODULES>'],
    ['^~(.*)$'],
    ['^[../]', '^[./]'],
]),
```

React and React Native first, then third-party, then aliased project imports, then relative ones.
Nobody reorders imports by hand, and no diff ever contains an import shuffle.

## ESLint

Start from `eslint-config-expo` (flat config) and add what the project needs. Rules worth having
everywhere:

- `unused-imports/no-unused-imports: error` — dead imports never reach the branch.
- `unused-imports/no-unused-vars: warn` with `^_` ignore patterns for deliberately unused arguments.
- `padding-line-between-statements` — a blank line before every `return` and after variable blocks.
  Small rule, large readability payoff in long components.
- `@tanstack/eslint-plugin-query` — catches missing dependencies in query keys.
- `no-restricted-imports` — to keep a wrapped library (styling engine, i18n) importable from exactly
  one module.

Do not disable rules inline without a reason on the same line. A bare `// eslint-disable-next-line`
is a silent hole.

## Logging

**Never `console.log` in shipped code.** Use a logger that reports where it matters:

```typescript
export const logger = {
    warn,
    info,
    debug,
    trace,
    error,          // logs locally AND reports to Sentry
    setLevel,
} as const;
```

The point of the wrapper is that `logger.error` does two things — writes the message and captures the
exception with its context — so no call site has to remember Sentry. Attach context as extras rather
than interpolating it into the message; a message with a user id in it is a message that never groups.

Query and mutation failures are logged once, centrally, in the query client caches — see
[API & data fetching](./data-fetching.md#the-query-client). Never log tokens or personal data.

## Utilities

`src/utils/` (or a `formatters` package) is for **pure functions with no React and no module
dependency**. If it imports from a module, it belongs in that module.

```typescript
// GOOD - pure, testable, reusable
export const formatNumberValue = (value: number, decimalPlaces = 2): string => { /* ... */ };
```

Prefer a well-tested library over your own helper — [radash](https://radash-docs.vercel.app/) for
collection and object work, `qs` for query strings, `date-fns` for dates. Every hand-rolled `groupBy`
is a bug waiting to be found in production.

Name utilities so the purpose is visible at the call site (`formatNumberValue`, not `format`) and keep
one concern per file.

## Scripts

Every project exposes the same verbs, whatever the package manager:

| Script            | Does                                          |
| ----------------- | --------------------------------------------- |
| `start`           | run the app                                   |
| `generate:api`    | regenerate the API client from OpenAPI        |
| `generate:icons`  | regenerate icon components from SVG           |
| `localize`        | pull translations from the spreadsheet        |
| `lint`            | ESLint                                        |
| `format`          | Prettier, writing                             |
| `tsc:ci`          | typecheck                                     |
| `test:unit`       | unit & component tests                        |
| `test:e2e`        | Maestro flows                                 |

## Quality gates

Typecheck, lint, format check, unit tests and E2E run in CI on every merge request, and every one
must be green before merge. Where the team wants faster feedback, run lint-staged, typecheck and
tests on pre-commit as well — the same checks, just earlier.

Commit messages, branch names and the branching model follow the
[Git styleguide](../../git/README.md).
