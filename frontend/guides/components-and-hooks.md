# 🧩 Components & hooks

The split is the whole point: **components render, hooks decide**. A component that is hard to read
is almost always a component holding logic that belongs in a hook.

## Components

Write components as arrow functions with a named export and a typed props interface:

```tsx
export interface ProductCardProps {
    product: ProductDto;
    variant?: 'big' | 'small';
}

export const ProductCard = ({ product, variant = 'big' }: ProductCardProps) => {
    /* ... */
};
```

The props type is named after the component — `ProductCardProps`, never `Props`. Export it: parents
routinely need to build on it (`Pick<ProductCardProps, 'variant'>`, `Omit<TextInputProps, 'name'>`).

One exported component per file. A helper used only inside that file can stay unexported, but the
moment something else needs it, it gets its own file.

### Keep them small

A component should fit on a screen. When it does not, it is usually doing two things that want
different names:

```
CartPage/
    CartPage.tsx              # layout: which parts, in what order
    EmptyCart/
    FilledCart/
    PromoCodeInput/
    TotalPrice/
        TotalPrice.tsx
        PromoCodeDiscount/
    index.ts
```

`CartPage` becomes a dozen readable lines, and every piece below it is independently testable,
independently re-renderable, and movable the day another screen needs it.

Signs it is time to split:

- A `return` you have to scroll to read.
- A piece of JSX guarded by a condition that has nothing to do with the rest.
- A chunk you could name in two words — `PromoCodeInput`, `TotalPrice` — but have not.
- Props that only exist to be threaded to one nested branch.

Do not split into pieces so small they only forward props. The test is whether the extracted part
has a name and a reason, not whether the parent got shorter.

### Keep logic out

```tsx
// BAD - fetching, deriving and rendering in one place
export const ProductList = ({ categoryId }: ProductListProps) => {
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        fetchProducts(categoryId)
            .then(setProducts)
            .finally(() => setIsLoading(false));
    }, [categoryId]);

    /* ... */
};

// GOOD - the component only renders
export const ProductList = ({ categoryId }: ProductListProps) => {
    const query = useProducts(categoryId);

    /* ... */
};
```

What stays in the component: JSX, prop destructuring, event handlers that only call into hooks, and
simple conditional rendering. Everything else — data fetching, derived values, effects, form
submission, business rules — moves to a hook in the module's `hooks/` folder.

### Loading and error states are components, not early returns

An `if (isLoading) return <Spinner />` at the top of every component is the same three lines copied
across the app, and it hides the happy path below a stack of guards. Wrap instead:

```tsx
// BAD
export const FiltersRow = () => {
    const query = useRowItems(categoryId);

    if (query.isLoading) return <ActivityIndicator />;
    if (query.isError) return <RetryButton onPress={query.refetch} />;

    return <XStack>{/* ... */}</XStack>;
};

// GOOD
export const FiltersRow = () => {
    const query = useRowItems(categoryId);

    return (
        <QueryError query={query}>
            <QueryLoader query={query}>
                <XStack>{/* ... */}</XStack>
            </QueryLoader>
        </QueryError>
    );
};
```

Both wrappers take the whole query object rather than a pile of booleans, so call sites cannot drift
apart. They live in the api module and accept a `skeleton` where a spinner is too coarse.

### Text goes through the design system

Never reach for the platform's raw text primitive. Use the typography components — `Heading`,
`Paragraph`, `Text` — so a type-scale change lands in one file:

```tsx
// BAD
<Text style={{ fontSize: 16, fontWeight: '600' }}>{product.name}</Text>

// GOOD
<Paragraph variant='mediumMedium'>{product.name}</Paragraph>
```

The same applies to every other shared primitive: check `ui/` (or the atoms package) before writing
a new `Button`, `Card` or `ListItem`. UI components live there and nowhere else — a feature module
that defines its own button has just forked the design system.

## Hooks

One hook per file, named `use…`, in the `hooks/` folder of the module or component that owns it.

### Return the query directly when there is only one

```typescript
// BAD - destructure then rebuild, losing refetch, isFetching, status, …
export const useProducts = (categoryId: number) => {
    const { data, isLoading, error } = useGetApiV1Products({ categoryId });

    return { data, isLoading, error };
};

// GOOD
export const useProducts = (categoryId: number) =>
    useGetApiV1Products({ categoryId }, { query: { enabled: Boolean(categoryId) } });
```

Re-wrapping throws away everything the caller did not think to forward — which is exactly what
`<QueryLoader query={query} />` needs. Build a custom object only when you genuinely combine several
queries or add derived data:

```typescript
export const useCheckoutData = () => {
    const cart = useGetApiV1Cart();
    const paymentMethods = useGetApiV1PaymentMethods();

    return {
        cart: cart.data,
        paymentMethods: paymentMethods.data,
        isLoading: cart.isLoading || paymentMethods.isLoading,
    };
};
```

### Co-locate hooks with what uses them

A hook used by one component lives in that component's folder; a hook used across a module lives in
the module's `hooks/`; a hook used across modules lives in `src/hooks/`. Promote a hook when the
second consumer appears, not in anticipation of one.

```
SignInPage/
    SignInPage.tsx
    hooks/
        useSignInSubmit.ts   # only SignInPage uses this
```

### Submission hooks own the side effects

A form's submit hook is where navigation, storage writes and error mapping belong — the component
stays a form:

```typescript
export function useSignInSubmit() {
    const navigation = useNavigation();
    const { setError } = useFormContext<SignInSchemaType>();

    return usePostApiV1AuthLogin({
        mutation: {
            onSuccess: async response => {
                await setAccessToken(response.data.token);
                navigation.dispatch(await postSignInRedirect());
            },
            onError: (error: Error) => {
                setError('root', { message: error.message || 'general.error' });
            },
        },
    });
}
```

## Comments

Default to none. Names carry the meaning; a comment that restates the code goes stale and lies later.

Write one only when the **why** is invisible: a workaround with a link to the upstream issue, a
constraint the API imposes, an ordering that looks arbitrary but is not. `// TODO:` with a ticket
number is fine.

```typescript
// BAD - says what the line already says
// Set the user
setUser(user);

// GOOD - says what the code cannot
// Every call to /user-context registers a login in the activity log, so it must not refetch
// on each mount. The login seeds the cache; readers take the identity from there.
queryClient.setQueryDefaults(getGetUserContextQueryKey(), { staleTime: Infinity });
```

## Performance

Reach for `memo`, `useMemo` and `useCallback` when you have a reason — a measured re-render, a list
row, an expensive computation, a value used as a hook dependency. Wrapping everything by reflex adds
noise and its own cost.
