# ⚛️ Frontend

Guidelines for frontend development at Ackee — React and TypeScript, with React Native / Expo as the
primary target. Most of it (structure, components, hooks, forms, data fetching, state) is
platform-agnostic; where a rule is platform-specific, it says so.

These are distilled from what our apps actually do, not from an ideal. Where two projects disagree,
the guide names both options and tells you to pick one per project rather than mixing them.

## Content

- [🗂️ Project structure](./guides/project-structure.md) - Modules, component folders, barrels, naming, imports
- [🧩 Components & hooks](./guides/components-and-hooks.md) - Small components, logic in hooks, wrappers over early returns
- [📝 Forms & Zod schemas](./guides/forms.md) - react-hook-form + Zod, shared validators, generic fields
- [🔌 API & data fetching](./guides/data-fetching.md) - Orval codegen, TanStack Query, the fetcher, invalidation
- [🏪 State management](./guides/state-management.md) - Server vs client vs local state, Zustand stores
- [🔐 Storage & secrets](./guides/storage-and-secrets.md) - SecureStore for tokens, AsyncStorage for the rest, env vars
- [🧭 Navigation](./guides/navigation.md) - expo-router and React Navigation, typed params, route constants
- [🎨 Design system](./guides/design-system.md) - UI module, tokens, typography, styling engines, Storybook
- [🌍 Localization](./guides/localization.md) - Typed message keys, lokse, key naming, plurals
- [🖼️ Icons & assets](./guides/icons-and-assets.md) - SVGR generation, currentColor, fonts and images
- [🧪 Testing](./guides/testing.md) - Jest/Vitest, Testing Library, MSW, Maestro E2E
- [🔧 Tooling & conventions](./guides/tooling.md) - TypeScript, Prettier, ESLint, logging, utilities, scripts

## Related

- [Git](../git/README.md) - Branch naming, commit messages, branching model
- [Backend coding guide](../backend/guides/code.md) - Naming and TypeScript rules shared across teams
