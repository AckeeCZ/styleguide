# 🗂️ Project structure

Frontend projects are organized into **modules**. A module owns one domain and keeps everything
it needs next to itself, so a feature can be read, moved or deleted in one piece.

## Folder layout

```
src/
    assets/          # fonts, images, raw SVGs
    config/          # env, routes, currency, query keys — app-wide constants
    hooks/           # hooks that belong to no single module
    localization/    # translation files and their generated types
    modules/         # the app itself, split by domain
    utils/           # pure helpers with no React and no module dependency
```

Everything else lives in `src/modules/`. A module contains only the folders it actually needs:

```
src/modules/auth/
    components/
    hooks/
    types/
    schemas/
    utils/
    constants/
    context/
    index.ts
```

Two kinds of modules exist, and it is worth keeping them apart:

- **Domain modules** (`auth`, `cart`, `orders`, `products`) — features. They may depend on shared modules.
- **Shared modules** (`ui`, `form`, `api`, `intl`, `test`) — infrastructure every feature builds on.
  They must not import from domain modules.

In a monorepo the same split is expressed with packages (`packages/atoms`, `packages/forms`,
`packages/api`) instead of folders. The rule is the same: shared code never reaches back into a feature.

## Component folders

One component per file, and the file is named after the component. A component that needs anything
else gets a folder of its own:

```
SignInPage/
    SignInPage.tsx          # the component, nothing else exported
    index.ts                # export * from './SignInPage'
    SignInPage.styled.ts    # styled primitives, when styling grows
    hooks/
        useSignInSubmit.ts
    schemas/
        signInSchema.ts
    utils/
        postSignInRedirect.ts
    SignInForm/             # sub-components nest as folders
        SignInForm.tsx
        index.ts
```

Nest a sub-component under its parent when only that parent uses it. The moment a second parent
needs it, move it up — to the module's `components/`, or to `ui/` if it stopped being domain-specific.

## Barrel files

Every folder that is imported from the outside has an `index.ts` re-exporting its public surface:

```typescript
// components/Form/index.ts
export * from './Form';
```

Barrels are what let a module present one import path. Import from the module, not from the file
inside it:

```typescript
// BAD - reaches past the module's public surface
import { Button } from '~modules/ui/components/Button/Button';

// GOOD
import { Button } from '~modules/ui/components';
```

Watch out for cycles: a barrel that re-exports everything makes it easy to create one by accident.
When a shared module must reach a domain module (a fetcher needing `logout`, say), import the file
directly and say why in a comment.

## Naming

| Thing                | Convention                    | Example                              |
| -------------------- | ----------------------------- | ------------------------------------ |
| Component file       | PascalCase, matches component | `ProductCard.tsx`                    |
| Hook file            | camelCase, `use` prefix       | `useSignInSubmit.ts`                 |
| Props type           | `<ComponentName>Props`        | `ButtonProps`, never `Props`         |
| Store hook           | `use<Domain>Store`            | `useFiltersStore`                    |
| Schema               | `<name>Schema` + `<Name>SchemaType` | `signInSchema`, `SignInSchemaType` |
| Constants and enums  | see [Backend coding guide](../../backend/guides/code.md#naming-conventions) | `MAX_CHARACTERS`, `QueryKey.ORDER_SUMMARY` |

The [naming rules in the backend guide](../../backend/guides/code.md#naming-conventions) are language
rules, not backend rules — booleans prefixed with `is`/`has`, `Error` suffix on errors, `T`-prefixed
generics, no repeated field prefixes. They apply here unchanged.

Two frontend additions:

1. **Functions start with a verb.** `formatCurrency`, `parsePageInfo`, `updateContract`.
2. **Predicate functions keep the verb too.** `getHasPermissions()`, not `hasPermissions()` — the
   `has`/`is` prefix alone reads as a value, and a function that looks like a value gets used like one.

## Imports

Always use path aliases, never `../../..` across module boundaries:

```typescript
// BAD
import { Button } from '../../../ui/components';

// GOOD
import { Button } from '~modules/ui/components';
```

Relative imports are correct — and preferred — *inside* one component folder, where they express
"this belongs to me":

```typescript
import { SignInForm } from './SignInForm';
import type { SignInSchemaType } from '../schemas';
```

Configure the alias once in `tsconfig.json` (`baseUrl: "src"` + `paths`) and let Jest reuse it with
`pathsToModuleNameMapper`, so tests and app resolve identically.

Import order is not a matter of taste — it is enforced by `@ianvs/prettier-plugin-sort-imports`:
React and React Native first, then third-party, then aliased project imports, then relative ones.

## Named exports only

```typescript
// BAD
export default SignInPage;

// GOOD
export const SignInPage = () => { /* ... */ };
```

Default exports get renamed at every import site, which breaks grep and makes refactors silent.
The only place default exports are acceptable is generated code (SVGR icons) where the generator
dictates the shape.
