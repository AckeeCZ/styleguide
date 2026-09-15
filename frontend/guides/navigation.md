# 🧭 Navigation

Two approaches are in use, and both are fine — pick one **per project** and never mix them:

- **expo-router** — file-based routes. Default for new apps: routes are discoverable by looking at
  the folder tree, deep linking and typed routes come for free.
- **React Navigation** — navigators declared in code. Use it when the app needs navigator structures
  that file-based routing makes awkward, or when the project predates expo-router.

expo-router is built on React Navigation, so the concepts below (stacks, tabs, screen options,
presentation modes) apply to both.

## expo-router

Routes are files under `src/app/`. The folder tree *is* the navigation graph:

```
src/app/
    _layout.tsx                    # root stack, providers, app bootstrap
    login.tsx                      # /login
    (public)/
        index.tsx                  # /
    (protected)/
        _layout.tsx                # auth guard for everything below
        (tabs)/
            _layout.tsx            # tab bar
            home/
                _layout.tsx
                index.tsx          # /home
            payments.tsx           # /payments
        profile/
            _layout.tsx
            index.tsx              # /profile
            login-security.tsx     # /profile/login-security
```

Conventions:

- **Route files stay thin.** A route renders a screen component that lives in a module; it does not
  hold the screen's markup or logic. The route is the URL, not the feature.
- **Group folders `(name)` carry policy, not path segments.** `(protected)/_layout.tsx` is the one
  place the auth redirect lives; `(public)` and `(tabs)` do the same for their concerns.
- **File names are kebab-case**, because they are URLs: `login-security.tsx`, `set-main-account.tsx`.
- **The root `_layout.tsx` is app bootstrap** — providers, splash screen, API initialization,
  analytics, theme. Order matters there; keep it readable and comment anything order-dependent.

## React Navigation

Route names come from one `Routes` constant, never from string literals scattered across the app:

```typescript
export const Routes = {
    index: 'index',
    tabs: 'tabs',
    auth: 'auth',
    authRoutes: {
        signIn: 'signIn',
        signUp: 'signUp',
    },
} as const;
```

```tsx
// BAD - a typo compiles and fails at runtime
navigation.navigate('auth', { screen: 'signin' });

// GOOD
navigation.navigate(Routes.auth, { screen: Routes.authRoutes.signIn });
```

### Type the param lists

Every navigator gets a param list keyed by those same constants, so params are checked at the call
site:

```typescript
export type AppStackParamList = {
    [Routes.index]: undefined;
    [Routes.tabs]: NavigatorScreenParams<TabParamList>;
    [Routes.auth]: NavigatorScreenParams<AuthStackParamList>;
};

export type AuthStackParamList = {
    [Routes.authRoutes.signIn]: { returnTo?: string } | undefined;
    [Routes.authRoutes.signUp]: undefined;
};
```

Nested navigators are declared with `NavigatorScreenParams<…>`, which is what makes
`navigate(Routes.auth, { screen: … })` type-check all the way down. Read params through a typed
route, never as `any`:

```typescript
const route = useRoute<RouteProp<AuthStackParamList, 'signIn'>>();
const returnTo = route.params?.returnTo;
```

### One navigator per file

Navigators are components and follow the same rules as any other: `AuthNavigator.tsx`,
`CartNavigator.tsx`, `TabNavigator.tsx`, each in its own folder under the app module, nested to
mirror the navigation tree.

### Screen options

Set shared options once in `screenOptions` on the navigator and override per screen only where the
screen genuinely differs. Options are the right place for presentation (`modal`,
`fullScreenModal`), headers and gestures:

```tsx
<Stack.Navigator
    screenOptions={{
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: theme.background.val },
    }}
>
    <Stack.Screen
        name={Routes.authRoutes.signUp}
        component={SignUpPage}
        options={{ title: formatMessage({ id: 'signUp.title' }), headerLeft: () => <BackButton /> }}
    />
</Stack.Navigator>
```

Header titles are translated like any other string — pull them from `formatMessage` / `t`, never
inline.

Theme colours come from the styling system, not from literals. A navigator also paints surfaces the
app does not own (the ground behind a card during a push); set those explicitly from the theme or
they fall back to the framework's default grey.

## Both approaches

- **Screens live in modules, routes point at them.** `modules/auth/components/SignInPage` is the
  screen; the route file or `<Stack.Screen>` only references it.
- **Deep links are declared, not improvised.** Configure prefixes in one place and keep link
  handling next to the navigator that owns the target.
- **Navigation side effects belong in hooks.** A submit hook decides where to go next
  (`postSignInRedirect`); the component just renders the form.
