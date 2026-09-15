# 🏪 State management

Three tiers, and picking the wrong one is the usual cause of stale data and mysterious re-renders:

| Kind                                                   | Tool                | Example                                     |
| ------------------------------------------------------ | ------------------- | ------------------------------------------- |
| **Server state** — anything the API owns                | TanStack Query      | products, cart contents, user profile       |
| **Client state** — shared across screens, ours to own   | Zustand             | selected filters, onboarding progress       |
| **Local state** — one component's business              | `useState`          | a toggle, an open dropdown, an input draft  |

The first rule is the important one: **never copy server data into a store.** Once an API response
lives in Zustand it stops being invalidated, refetched or garbage-collected, and now two sources
disagree. Keep it in the query cache and read it where you need it.

```typescript
// BAD - the cart now exists twice, and the copy goes stale
const { data } = useGetApiV1Cart();
useEffect(() => setCartItems(data?.items ?? []), [data]);

// GOOD
const { data: cart } = useGetApiV1Cart();
```

## Zustand stores

One store per domain, typed, created with `create<T>()`:

```typescript
import { create } from 'zustand';

type AuthStoreType = {
    user: UserDto | null;

    setUser: (user: UserDto | null) => void;
    reset: () => void;
};

export const useAuthStore = create<AuthStoreType>()(set => ({
    user: null,

    setUser: user => set({ user }),
    reset: () => set({ user: null }),
}));
```

Conventions:

- Hook is `use<Domain>Store`; the state type is `<Domain>StoreType`.
- State fields first, then actions, with a blank line between. Actions are part of the type.
- **Every store has a `reset`.** Logout, account switch and test setup all need it, and a store
  without one leaks the previous user's data into the next session.
- Stores are per domain. One god store means every consumer re-renders on every change.

### Selectors

Subscribe to what you use, not to the whole store:

```typescript
// BAD - re-renders on any store change
const { user } = useAuthStore();

// GOOD - re-renders only when user changes
const user = useAuthStore(state => state.user);
```

### Derived values are computed, not stored

```typescript
// BAD - two fields that can disagree
type CartStoreType = {
    items: CartItem[];
    itemCount: number;
};

// GOOD
const itemCount = useCartStore(state => state.items.length);
```

Storing a derived value means every writer must remember to update it. Compute it in the selector,
or in a hook if the computation is expensive enough to memoize.

### Where stores live

In the module that owns the domain — `modules/auth/hooks/useAuthStore.ts`,
`modules/filters/store/index.ts`. A store used by one screen can live in that screen's folder. Only
genuinely app-wide state belongs outside a module.

## When Zustand is the wrong answer

- **Server data** → TanStack Query (above).
- **Form state** → react-hook-form. A form in a store is a form that fights its own validation.
- **State one component uses** → `useState`. Global by default is how a codebase becomes untestable.
- **State a subtree shares but the app does not** → React context. Contexts are used in both projects
  for exactly this (auth storage, current language, filter sync) and stay cheaper than a store when
  the value is stable.

## Persistence

Some state must outlive the process — language, onboarding completion, tokens. That is a storage
question, not a state question, and the answer differs by sensitivity: see
[Storage & secrets](./storage-and-secrets.md).
