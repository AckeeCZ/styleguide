# 🔌 API & data fetching

Server state is **generated, never hand-written**. The OpenAPI document is the contract; Orval turns
it into typed TanStack Query hooks; nobody calls `fetch` directly.

## Orval setup

The API module owns the whole pipeline:

```
modules/api/            # or packages/api in a monorepo
    open-api/           # the OpenAPI documents (committed)
    codegen/            # generated output (committed, never edited)
        smarty/
            endpoints.ts
            model/
    fetcher/            # the mutator Orval calls
    components/         # AppQueryProvider, QueryLoader, QueryError
    hooks/              # useInvalidateQuery
    constants/          # query and mutation keys
    index.ts            # re-exports codegen + everything above
```

Generate one namespace per API the app talks to, and build the output config from a factory so the
namespaces cannot drift:

```typescript
type ApiNamespace = 'smarty' | 'ares';

const outputDirectory = './src/modules/api/codegen';

const createOutput = (namespace: ApiNamespace) =>
    ({
        target: `${outputDirectory}/${namespace}/endpoints.ts`,
        schemas: `${outputDirectory}/${namespace}/model`,
        client: 'react-query',
        clean: true,
        indexFiles: true,

        override: {
            mutator: {
                path: './src/modules/api/fetcher/fetcher.ts',
                name: fetcherByNamespace[namespace],
            },
        },
    }) as const satisfies Options['output'];

export default defineConfig({
    api: { input: './src/modules/api/open-api/smarty-openapi.json', output: createOutput('smarty') },
    ares: { input: './src/modules/api/open-api/ares-openapi.json', output: createOutput('ares') },
});
```

Notes that matter:

- `clean: true` — deleted endpoints disappear instead of lingering as dead hooks.
- `client: 'react-query'` — the generated hooks *are* the query layer, not a layer under it.
- `override.mutator` — every request goes through our own fetcher, so auth, headers and error
  handling exist in exactly one place.
- **Commit the generated code.** CI, typecheck and review all need it, and a diff on `codegen/` is
  the clearest possible signal that the backend contract moved.

Regenerate with a script that also formats, so the diff is real changes and not whitespace:

```jsonc
"generate:api": "orval && prettier --write ./src/modules/api/codegen/**/*.ts"
```

## The fetcher (mutator)

One fetcher per API namespace, built on [`up-fetch`](https://github.com/L-Blondy/up-fetch) over the
platform `fetch`. Create the instance lazily and reuse it:

```typescript
let upFetchInstance: UpFetch | null = null;

export const api = () => {
    if (!upFetchInstance) {
        upFetchInstance = up(fetch, () => ({
            timeout: 30000,
            serializeParams: params => stringify(params, { encode: false, arrayFormat: 'comma' }),
            parseResponse: async (response: Response) => {
                if (response.status === 204) {
                    return { data: null, response };
                }

                return { data: await response.json(), response };
            },
        }));
    }

    return upFetchInstance;
};
```

The mutator returns `{ data, response }` — keeping the raw `Response` means headers (pagination,
correlation ids) stay reachable without a second mechanism.

Auth belongs here, not at call sites: attach the bearer token before the request, and handle `401`
by refreshing once and retrying, or logging out when there is no refresh token.

```typescript
if (isResponseError(error) && error.status === 401) {
    /* refresh the token, or log out */
}
```

In a monorepo, keep the API package free of app-specific knowledge by injecting it at startup:

```typescript
initializeApi({
    baseUrl: process.env.EXPO_PUBLIC_API_ORIGIN,
    getHeaders: getAuthHeaders,
    onResponseError: handleUnauthorized,
});
```

## Using the generated hooks

Import from the API module barrel — never from a path inside `codegen/`:

```tsx
import { useGetApiV1Products, usePostApiV1Cart, getGetApiV1ProductsQueryKey } from '~modules/api';
```

Wrap the generated hook in a module hook when there is anything to say about it (an `enabled`
condition, a `select`, defaults). Otherwise use it directly:

```typescript
export const useProducts = (categoryId: number) =>
    useGetApiV1Products({ categoryId }, { query: { enabled: Boolean(categoryId) } });
```

Render with the wrappers rather than early returns — see
[Components & hooks](./components-and-hooks.md#loading-and-error-states-are-components-not-early-returns).

## Query keys

Generated endpoints bring their own keys; use the generated getter and never retype the string:

```typescript
// BAD - a typo here silently invalidates nothing
queryClient.invalidateQueries({ queryKey: ['/api/v1/products'] });

// GOOD
queryClient.invalidateQueries({ queryKey: getGetApiV1ProductsQueryKey() });
```

Queries that are *not* generated (derived, composed, or client-only) get a key from an enum, so the
set of keys is enumerable and greppable:

```typescript
export enum QueryKey {
    CURRENT_LANGUAGE = 'currentLanguage',
    ORDER_SUMMARY = 'orderSummary',
}
```

## Invalidation

Invalidate from the mutation that caused the change — the mutation knows what it invalidated, the
screen does not:

```typescript
usePostApiV1Cart({
    mutation: {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetApiV1CartQueryKey() });
        },
    },
});
```

For non-generated keys use the shared `useInvalidateQuery` hook, which handles both bare keys and
keys with arguments:

```typescript
const { invalidateQuery, invalidateQueries } = useInvalidateQuery();

// keys without arguments
await invalidateQueries([QueryKey.ORDER_SUMMARY, QueryKey.CURRENT_LANGUAGE]);

// keys with arguments
await invalidateQueries([
    [QueryKey.ORDER_SUMMARY, orderId],
    [QueryKey.FILTER_ROW_ITEMS, categoryId],
]);
```

## The query client

One `QueryClient`, created once and provided at the root. Log cache-level failures centrally instead
of adding an `onError` to every call:

```tsx
export function AppQueryProvider({ children, dehydratedState, queryClientConfig = {} }: AppQueryProviderProps) {
    const [queryClient] = useState(
        new QueryClient({
            queryCache: new QueryCache({ onError: (error, query) => logger.error(error, query) }),
            mutationCache: new MutationCache({ onError: error => logger.error(error) }),
            ...queryClientConfig,
        }),
    );

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

Endpoints with side effects need explicit defaults. If calling an endpoint *does* something — writes
an audit entry, registers a login — it must not refetch on every mount:

```typescript
queryClient.setQueryDefaults(getGetUserContextQueryKey(), { staleTime: Infinity });
```

## Rules

- ❌ Never call `fetch` or a HTTP client directly from a component or feature hook.
- ❌ Never edit anything under `codegen/` — the next generation overwrites it.
- ❌ Never hand-write a query key that a generator already provides.
- ✅ Regenerate and commit `codegen/` whenever the OpenAPI document changes.
- ✅ Keep auth, headers, timeouts and 401 handling in the fetcher, in one place.
