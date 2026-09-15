# 🧪 Testing

Three layers, each answering a different question:

| Layer            | Tool                                        | Answers                                        |
| ---------------- | ------------------------------------------- | ---------------------------------------------- |
| **Unit**         | Jest (`jest-expo`) · Vitest on web          | does this function/hook/component behave?       |
| **Component**    | `@testing-library/react-native` + MSW       | does the screen do the right thing to the user? |
| **E2E**          | Maestro                                     | does the real app on a real device still work?  |

## Unit & component tests

Tests live in `__tests__/` next to the code they cover, named `*.test.ts(x)`:

```
ProductCard/
    ProductCard.tsx
    __tests__/
        productCard.test.tsx
```

On React Native use **jest-expo**; on web use **Vitest** — it needs no Babel pipeline, runs on the
project's existing Vite config, and is substantially faster. The conventions below apply to both.

Reuse the tsconfig path aliases so tests import exactly like the app does:

```javascript
moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src/' }),
```

### Render through the app's providers

A screen needs theme, query client, i18n and navigation to render at all. Wrap that once and use it
everywhere, instead of assembling providers per test:

```tsx
// modules/test/utils
export const customRender = (component: React.ReactElement) =>
    render(<TestContextProviders>{component}</TestContextProviders>);
```

`TestContextProviders` mirrors the real root: navigation container, `QueryClientProvider` (with
`retry: false`, so a failing request fails the test instead of hanging it), theme provider, i18n.

### Test behaviour, not implementation

```tsx
// BAD - asserts on internals; a refactor breaks it, a bug does not
expect(wrapper.find('Button').props().disabled).toBe(true);

// GOOD - asserts what the user gets
const button = screen.getByText('Do košíku');
await userEvent.press(button);

expect(screen.getByTestId(TEST_IDS.PRODUCT_CARD.ADD_TO_CART_BUTTON)).toBeDisabled();
```

Query by what the user perceives — text first, role second, `testID` only when neither works (icons,
containers). Keep test ids in one `TEST_IDS` constant so E2E flows and unit tests refer to the same
handles instead of drifting apart.

### Mock the network with MSW, not the module

```typescript
// BAD - mocks the hook, so the API contract is never exercised
jest.mock('~modules/api', () => ({ useGetApiV1Cart: () => ({ data: mockCart }) }));

// GOOD - mocks the HTTP layer; the real hook, fetcher and parsing all run
export const cartHandlers = [
    http.get('*/api/v1/cart', () => HttpResponse.json(cartFixture)),
];
```

Fixtures live with the handlers (`modules/test/mocks`), so one shape change updates every test.

### What is worth testing

- Business logic in hooks — the branching, the derived values, the error mapping.
- Validation schemas — each rule, at its boundary.
- Formatters and utilities — cheap to test, easy to get subtly wrong.
- Screens: the states a user can reach — loading, error, empty, populated, submitting.

Do not test the framework, generated code, or a component that only forwards props.

## E2E with Maestro

Maestro flows are YAML, live in `.maestro/` (or an `e2e` package), and drive the real build:

```yaml
appId: cz.example.app
---
- launchApp:
      clearState: true
- assertVisible: 'Sleduj každý krok své objednávky'
- tapOn: 'Pokračovat'
- assertVisible:
      text: 'Pokračovat'
      enabled: false
- tapOn: 'Česká republika'
- tapOn: 'Pokračovat'
```

Conventions:

- **`clearState: true` at the start of every flow.** A flow that depends on the previous flow's state
  is a flow that fails in isolation and passes in CI by luck.
- **Factor repeated steps into `common/`** — `log-in.yaml`, `open-profile.yaml`,
  `fill-login-form.yaml` — and `runFlow` them. Login should be written once.
- **Assert before you tap.** `assertVisible` before `tapOn` turns a timing failure into a readable
  one.
- **Cover the money paths**, not every screen: onboarding, login, checkout, payment. E2E is the slow,
  expensive layer — spend it where a regression is unacceptable.
- **Point E2E at mocks, not production.** Ship a build flavour with mocking enabled
  (`EXPO_PUBLIC_USE_MOCKS=true`) so flows are deterministic and safe to run repeatedly.

## In CI

Typecheck, lint, unit tests and the E2E suite all run on every merge request, and all must be green.
Report unit results as JUnit XML and coverage as Cobertura so the CI UI can display them:

```javascript
reporters: ['default', ['jest-junit', { outputDirectory: 'test-results', outputName: 'junit.xml' }]],
collectCoverage: process.env.GITLAB_CI === 'true',
coverageReporters: ['text', 'cobertura'],
```
