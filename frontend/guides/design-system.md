# 🎨 Design system

Every project has one place where UI primitives live — `src/modules/ui/` in a single app, a
`packages/atoms` + `packages/layout` pair in a monorepo. A feature module that defines its own
button has forked the design system, and the fork is permanent.

## Layers

1. **Tokens** — colours, spacing, typography scale, radii. Defined once in the theme config.
2. **Atoms** — `Button`, `Text`, `Heading`, `Paragraph`, `Card`, `Badge`, `Checkbox`, `Icon`.
   No domain knowledge, no data fetching.
3. **Layout / composition** — `ListItem`, `ButtonGroup`, `BottomSheet`, `Tabs`. Atoms combined into
   recurring arrangements.
4. **Feature components** — everything in domain modules, built from the three layers above.

Check the layer below before adding to the one above. Most "we need a new component" turns out to be
a missing variant on an existing one.

## Tokens, never literals

```tsx
// BAD - a hex code and a magic number, invisible to theming
<View style={{ backgroundColor: '#c02485', padding: 16 }} />

// GOOD
<View backgroundColor='$accentPrimary' padding='$2' />
```

Hardcoded colours are what makes dark mode a rewrite. Everything visual comes from the theme:
colours, spacing steps, font sizes, line heights, radii.

Variants belong on the component, expressed through the styling engine's variant mechanism, not
through a pile of boolean props or a `style` prop threaded from the call site:

```typescript
export const StyledInputContainer = styled(View, {
    borderRadius: '$1',
    borderWidth: 1,

    variants: {
        error: {
            true: { borderColor: '$error', backgroundColor: '$errorBackground' },
        },
    },
});
```

Keep styled primitives in a sibling `Component.styled.ts` once styling outgrows a few lines. The
`.tsx` then reads as structure and behaviour, which is what reviewers actually need to see.

## Typography components

Never use the platform's raw text primitive in a feature. `Heading`, `Paragraph` and `Text` carry the
type scale; using `<Text style={{ fontSize: 16 }}>` bypasses it and guarantees the next redesign
misses that line.

```tsx
// BAD
<Text style={{ fontSize: 16, fontWeight: '600' }}>{product.name}</Text>

// GOOD
<Paragraph variant='mediumMedium'>{product.name}</Paragraph>
```

## Styling engines

Both are in use, and both are acceptable — choose one per project:

- **Tamagui** — themed primitives (`XStack`, `YStack`, `View`, `Input`) with token props and
  `styled()` variants.
- **react-native-unistyles** — `StyleSheet.create(theme => …)` with `useVariants()` for prop-driven
  styles.

Whichever it is, **import it through one internal module**. A `packages/styles` that re-exports
`StyleSheet`, the runtime and the theme types — and is the only place allowed to import the library
directly — keeps theme module augmentation loading consistently and makes the engine replaceable.
Enforce it with `no-restricted-imports` rather than trust.

## Storybook

Storybook is the design system's workbench: every atom is developed, reviewed and demoed there
before a feature consumes it.

```tsx
const meta = {
    title: 'Atoms/Badge',
    component: Badge,
    args: { label: 'Label' },
    render: args => (
        <View style={{ padding: 16 }}>
            <Badge {...args} />
        </View>
    ),
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Small: Story = { args: { size: 'small', hasIcon: true } };
export const AllVariants: Story = {
    render: () => (/* every variant side by side */),
};
```

Conventions:

- **A story file sits next to its component**: `Badge.tsx` + `Badge.stories.tsx`.
- **Every exported atom has a story.** Enforce it with a check in CI and pre-commit — a rule nobody
  verifies is a rule nobody follows.
- `satisfies Meta<typeof Component>` gives typed `args`, so a renamed prop breaks the story.
- Include an **`AllVariants` story** rendering the full matrix. It is the fastest review surface for
  a design change and the first place a missing dark-mode token shows up.
- On React Native, Storybook runs as its own on-device app that discovers
  `packages/*/src/**/*.stories.tsx`.

## Rules

- ❌ No UI primitives outside the design system module/package.
- ❌ No hex colours, magic spacing, or raw text primitives in feature code.
- ❌ No direct import of the styling library outside the styles module.
- ✅ New atom → new story, same commit.
- ✅ Extend an existing component with a variant before creating a new one.
