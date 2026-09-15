# 🌍 Localization

No user-facing string is ever written in a component. Every one of them is a key, resolved at render
time.

```tsx
// BAD
<Paragraph>Pokračovat</Paragraph>

// GOOD
<Paragraph>
    <FormattedMessage id='general.continue' />
</Paragraph>
```

## Libraries

- **react-intl** (`FormattedMessage`, `useIntl`) — for projects already on it, and wherever ICU
  message formatting, plurals and rich text matter.
- **i18next / react-i18next** (`useTranslation`) — the lighter option, good default for new apps.

Pick one per project. Either way, wrap it in an internal module (`modules/intl`, `packages/i18n`) so
the rest of the app imports `useTranslation` / `useIntl` from *our* module, not the library. Language
detection, persistence and the provider all live there.

## Typed message keys

This is the part worth the effort: make an unknown key a **compile error**.

With react-intl, declare the keys globally from the translation JSON:

```typescript
export type MessageKey = keyof (typeof translations)[Language];

declare global {
    namespace FormatjsIntl {
        interface Message {
            ids: MessageKey;
        }
        interface IntlConfig {
            locale: Language;
        }
    }
}
```

With i18next, augment its own types:

```typescript
import type cs from '../locales/cs.json';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: { translation: typeof cs };
    }
}
```

Both give autocompletion on every key and a red squiggle on every typo. Anything that stores a key —
form validators, error maps, screen-view tracking — should be constrained by it:

```typescript
export const formError = {
    required: 'form.error.required',
    email: 'form.error.email',
} as const satisfies Record<string, MessageKey>;
```

## Translation source

Translations come from a **Google spreadsheet**, pulled with [lokse](https://github.com/AckeeCZ/lokse)
and committed:

```javascript
module.exports = {
    sheetId: '1yM462DexFQfYniP2HoKtBnxrWnq9epKjfMzuHkwvwKI',
    dir: 'src/localization/translations',
    languages: Object.values(languages),
    column: 'key_app',
    splitTranslations: true,
};
```

```
yarn localize     # pull the current sheet into the repo
```

Rules that follow from this:

- **Never hand-edit the generated JSON** — the next `localize` overwrites it. Change the sheet.
- **Commit the pulled files.** Builds, typecheck and the `MessageKey` type all depend on them.
- **Add the key to the sheet before using it**, so the app never ships a raw key as UI.

## Key naming

Namespace by feature, dot-separated, camelCase segments:

```
general.continue
general.country.cz
signIn.title
form.error.phoneNumber
cart.promoCode.applied
```

`general.*` is for genuinely global strings; everything else is prefixed by its module. Name the key
after **meaning, not text** — `general.confirm`, not `general.ok` — so a copy change does not require
a key change.

## Formatting values

Dates, numbers and currency go through the i18n layer, never through string concatenation:

```tsx
// BAD
<Paragraph>{`${price} Kč`}</Paragraph>

// GOOD
<FormattedCurrency value={price} />
```

Wrap the recurring cases (currency, address, units) in small components or formatters so the locale
rules exist once. Pure formatting helpers with no React dependency belong in `utils/` or a
`formatters` package — easy to unit test, reusable outside the render tree.

## Pluralization

Use the message format's plural support rather than branching in the component:

```json
{
    "cart.items": "{count, plural, =0 {Košík je prázdný} one {# položka} few {# položky} other {# položek}}"
}
```

Czech and Slovak have a `few` category that English does not. Writing `count === 1 ? … : …` in a
component produces wrong grammar in both.

## Rules

- ❌ No string literal rendered to the user.
- ❌ No hand-edited translation JSON.
- ❌ No manual plural or date formatting.
- ✅ Keys typed against the translation file.
- ✅ Key added to the spreadsheet first, then used.
