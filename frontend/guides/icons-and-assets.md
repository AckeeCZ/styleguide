# 🖼️ Icons & assets

Icons are **generated from SVG, never hand-written**. A designer's export drops into an assets
folder, a script turns it into a typed component, and nobody edits the result.

## The pipeline

```
Icons/
    assets/
        icons/           # raw .svg exports from Figma — the only hand-managed part
        logos/
    config/
        core.mjs         # shared SVGR options
        icons.mjs        # per-set config (outDir, colour map)
    icons/               # generated components — never edited
    index.ts             # generated barrel
```

```jsonc
"generate:icons": "svgr src/.../assets/icons --config-file src/.../config/icons.mjs && yarn format:icons",
"format:icons":   "prettier --write '…/Icons/**/*.{tsx,ts}' && eslint '…/Icons/**/*.{tsx,ts}' --fix"
```

SVGR 8's bundled prettier plugin is incompatible with prettier 3, so formatting is a **separate step
after generation** using the repo's own prettier and eslint. Output is committed — CI and typecheck
need it.

## SVGR config

```javascript
export default {
    icon: true,            // size from the viewBox; width/height props still override
    native: true,          // react-native-svg output
    typescript: true,
    jsxRuntime: 'automatic',
    outDir: 'src/modules/ui/components/Icons/icons',

    replaceAttrValues: {
        '#000': 'currentColor',
        '#1E1E1E': 'currentColor',
        '#C02485': 'currentColor',
        black: 'currentColor',
        white: 'currentColor',
    },

    svgoConfig: {
        plugins: [{ name: 'removeAttrs', params: { attrs: ['style', 'xmlns'] } }],
    },

    prettier: false,
};
```

The key line is `replaceAttrValues`. Single-tone icons are exported in whatever colour the design
file happened to use; mapping those fills to `currentColor` is what makes an icon themeable:

```tsx
<IconArrowLeft color={theme.textPrimary.val} width={24} height={24} />
```

Without it every icon is permanently the colour it was exported in, and dark mode loses. When a
genuinely multi-tone icon arrives, leave its second colour out of the map.

## The index template

Generate the barrel too, so adding an SVG is the whole task:

```javascript
indexTemplate: files =>
    files
        .map(file => {
            const name = file.path.split('/').pop().replace('.tsx', '');

            return `export { default as Icon${name} } from './${name}';`;
        })
        .join('\n'),
```

Every icon is exported as `Icon<Name>` — a prefix that makes icons greppable and keeps them from
colliding with components of the same name (`IconCart` vs `Cart`).

For a large set it pays to emit a lookup map and a union type alongside the components, which gives a
single `<Icon name='arrow-left' />` entry point with an autocompleting, type-checked `name`:

```typescript
export const iconComponents = { 'arrow-left': IconArrowLeft /* … */ } as const;
export type IconName = keyof typeof iconComponents;
```

```tsx
export const Icon = ({ name, ...props }: IconProps) => {
    const IconComponent = iconComponents[name];

    return <IconComponent {...props} />;
};
```

Keep the per-icon components exported as well — they are the tree-shakeable escape hatch when a
screen needs exactly one.

## Workflow

1. Export the SVG from Figma into `assets/icons/`, named in kebab-case (`arrow-left.svg`).
2. Run `yarn generate:icons`.
3. Commit both the SVG and the generated component.

Never edit a file under the generated directory — the next run erases it. If an icon renders wrong,
fix the SVG or the SVGR config.

Generate separate sets (icons, logos, pictograms) with separate configs sharing a `core.mjs`. Logos
are usually multi-colour and must *not* get the `currentColor` treatment.

## Other assets

- **Images** go in `src/assets/images/`, referenced through the bundler, not by remote URL for
  anything shipped with the app.
- **Fonts** go in `src/assets/fonts/` and load through `expo-font` behind a `useCustomFonts` hook;
  the app renders nothing until they resolve, so text never reflows on first paint.
- **Remote images** use `expo-image` rather than the platform `Image` — it brings caching,
  placeholders and transitions.
- Prefer **SVG over PNG** for anything that is not a photograph; one file scales to every density.
