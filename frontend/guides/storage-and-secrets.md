# 🔐 Storage & secrets

Two storages, and the choice is about **sensitivity, not convenience**.

| Storage                              | Backed by                       | Use for                                            |
| ------------------------------------ | ------------------------------- | -------------------------------------------------- |
| `expo-secure-store`                  | iOS Keychain / Android Keystore | access & refresh tokens, PINs, anything credential |
| `@react-native-async-storage/…`      | plain file on disk              | language, region, onboarding seen, UI preferences  |

## Secrets go in the Keychain

`AsyncStorage` is an unencrypted file. On a rooted or jailbroken device — and in any local backup —
its contents are readable. **Tokens must not live there.**

```typescript
// BAD - a bearer token in plain text on disk
export const setAccessToken = (token: string) => AsyncStorage.setItem(StorageKey.ACCESS_TOKEN, token);

// GOOD - Keychain / Keystore
import * as SecureStore from 'expo-secure-store';

export const setAccessToken = (token: string) =>
    SecureStore.setItemAsync(SecureStorageKey.ACCESS_TOKEN, token);
```

> ⚠️ Both current apps still keep access and refresh tokens in `AsyncStorage`. That is the thing this
> rule exists to change — migrate when touching the auth module, and use `expo-secure-store` from the
> start in new projects.

Things to know about `expo-secure-store`:

- Values are strings, max ~2 KB per entry. Store the token, not the whole session object.
- Every call is async, on both reads and writes. Design the auth bootstrap around that — a splash
  screen that waits, not a synchronous read.
- It is unavailable on web. Behind a shared interface, give web its own implementation (an
  httpOnly cookie set by the backend is the right answer there — not `localStorage`).
- Deleting the app clears the Keystore on Android; on iOS, Keychain entries can survive a reinstall.
  Clear tokens explicitly on logout rather than trusting the uninstall.

## Wrap the storage, don't call it inline

Every key gets a typed accessor in one module, so no component ever types a key string:

```typescript
export enum SecureStorageKey {
    ACCESS_TOKEN = 'accessToken',
    REFRESH_TOKEN = 'refreshToken',
}

export const getAccessToken = () => SecureStore.getItemAsync(SecureStorageKey.ACCESS_TOKEN);
export const setAccessToken = (token: string) => SecureStore.setItemAsync(SecureStorageKey.ACCESS_TOKEN, token);
export const removeAccessToken = () => SecureStore.deleteItemAsync(SecureStorageKey.ACCESS_TOKEN);
```

Keys live in an enum, accessors are `get` / `set` / `remove` triples, and the storage library is
imported in exactly one folder. Swapping `AsyncStorage` for `SecureStore` is then a change in one
file instead of a search across the app.

The fetcher reads tokens through these accessors — see
[API & data fetching](./data-fetching.md#the-fetcher-mutator).

## Logout clears everything

Logging out removes every stored secret, resets every Zustand store and clears the query cache.
Anything you forget becomes the next user's data:

```typescript
export const logout = async () => {
    await Promise.all([removeAccessToken(), removeRefreshToken(), removeUserIdent()]);

    useAuthStore.getState().reset();
    queryClient.clear();
};
```

## Environment variables are not secrets

Anything prefixed `EXPO_PUBLIC_` is **compiled into the bundle** and readable by anyone with the app.
API origins and public keys are fine; API secrets, private keys and signing credentials are not —
those belong on the backend or in EAS secrets.

Validate the environment at startup so a missing variable fails immediately and loudly, instead of
surfacing as `undefined` in a URL:

```typescript
export const env = createEnv({
    clientPrefix: 'EXPO_PUBLIC_',
    client: {
        EXPO_PUBLIC_API_ORIGIN: z.string().url(),
        EXPO_PUBLIC_SENTRY_DSN: z.string(),
    },
    runtimeEnv: {
        EXPO_PUBLIC_API_ORIGIN: process.env.EXPO_PUBLIC_API_ORIGIN,
        EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    },
    emptyStringAsUndefined: true,
});
```

Import `env` everywhere instead of touching `process.env` directly, and never commit `.env.local` —
commit a `.env.local.sample` that documents each variable.

## Rules

- ❌ Never put a token, password or PIN in `AsyncStorage`, Zustand, or a query cache that is persisted.
- ❌ Never log a token — not even at `debug` level. Log that a refresh happened, not what it returned.
- ❌ Never read `process.env` outside the env config.
- ✅ One accessor module per storage, keys in an enum.
- ✅ Clear secrets, stores and query cache on logout.
