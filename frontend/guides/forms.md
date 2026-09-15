# 📝 Forms & Zod schemas

**react-hook-form** for state, **Zod** for validation, `@hookform/resolvers` to join them. The schema
is the single source of truth: it validates *and* it types the form.

## The schema

One schema per form, in the form's `schemas/` folder, built from shared validators:

```typescript
// schemas/signInSchema.ts
import { object, type infer as ZodInfer } from 'zod';

import { email, newPassword } from '~modules/form/validators';

export const signInSchema = object({
    userName: email,
    password: newPassword,
});

export type SignInSchemaType = ZodInfer<typeof signInSchema>;
```

Always derive the type with `z.infer` — never declare it by hand, or the two drift the first time a
field is added.

## Shared validators

Field-level rules live once in `modules/form/validators` and are composed per form. Writing
`z.string().email()` inline is how two screens end up disagreeing about what an email is.

```typescript
export const required = z
    .string({ required_error: formError.required, invalid_type_error: formError.required })
    .trim();

export const requiredNonEmpty = required.pipe(z.string().min(1, { message: formError.required }));

export const email = required.pipe(z.string().email({ message: formError.email }));

export const phoneNumber = z
    .string()
    .transform(removeSpaces)
    .refine(value => value.length === 0 || phoneNumberRegex.test(value), { message: formError.phoneNumber });
```

Compose with `.pipe()` so each validator stays a single rule, and use `.refine()` / `.superRefine()`
for anything that needs more than one field. Conditional forms use `z.discriminatedUnion()` rather
than a pile of optional fields.

### Error messages are translation keys

A validator stores a **key**, not a sentence. The resolver translates it at render time, so the same
schema works in every language and errors can be asserted in tests:

```typescript
export const formError = {
    required: 'form.error.required',
    email: 'form.error.email',
    phoneNumber: 'form.error.phoneNumber',
} as const satisfies Record<string, MessageKey>;
```

The `satisfies Record<string, MessageKey>` is what makes a typo a compile error instead of a missing
translation in production.

## The Form component

A single generic `Form` wires the resolver, the defaults and the provider. Screens never call
`useForm` directly:

```tsx
export const Form = <FormSchema extends UnknownFormSchema, FormValues extends UnknownFormValues>({
    schema,
    children,
    defaultValues,
    formProps,
}: FormProps<FormSchema, FormValues>) => {
    const resolver = useLocalizedResolver(schema);
    const form = useForm<FormValues>({
        resolver,
        defaultValues,
        mode: 'onChange',
        reValidateMode: 'onChange',
        ...formProps,
    });

    return <FormProvider<FormValues> {...form}>{children}</FormProvider>;
};
```

Use it by passing the schema and composing fields:

```tsx
<Form schema={signInSchema} defaultValues={defaultValues}>
    <TextField<SignInSchemaType> name='userName' label={formatMessage({ id: 'signIn.email' })} />
    <PasswordField<SignInSchemaType> name='password' />
    <SignInFormSubmit />
</Form>
```

The localized resolver wraps `zodResolver` and maps every message key through `react-intl` before
handing errors back, so no field component has to think about translation.

## Field components

Fields live in `modules/form/components/fields` and follow one shape:

```tsx
export interface TextFieldProps<TFormValues extends UnknownFormValues> extends Omit<TextInputProps, 'name'> {
    name: Path<TFormValues>;
    required?: boolean;
}

export const TextField = <TFormValues extends UnknownFormValues>({
    name,
    required = false,
    disabled,
    ...props
}: TextFieldProps<TFormValues>) => {
    const { control, formState: { isSubmitting } } = useFormContext<TFormValues>();
    const { field, fieldState: { error } } = useController<TFormValues>({ control, name, disabled });

    return (
        <TextInput
            {...props}
            {...field}
            error={error}
            required={required}
            disabled={Boolean(field.disabled || isSubmitting || disabled)}
        />
    );
};
```

What every field must do:

- Be **generic over `TFormValues`**, with `name: Path<TFormValues>` — so a renamed schema field is a
  type error, not a silently dead input.
- Read the form through `useFormContext()`, register through `useController()`. Never take `control`
  as a prop.
- **Disable itself while submitting** (`isSubmitting`), so a double tap cannot double submit.
- Pass `error` down to the presentational input; the field decides nothing about how the error looks.

Keep the presentational input (`TextInput`) separate from the connected field (`TextField`). The
input knows about styling and layout; the field knows about the form. That split is what lets the
same input appear outside a form.

## Submitting

Submission is a hook, not an inline handler — see
[Components & hooks](./components-and-hooks.md#submission-hooks-own-the-side-effects). Map server
errors onto the form via `setError('root', …)` so failures land where the user is looking.

## Rules

- ❌ Never validate by hand alongside a schema — the schema is the only validator.
- ❌ Never hardcode an error message; store a translation key.
- ❌ Never pass `control` through props when `useFormContext()` is available.
- ✅ Derive the form type with `z.infer`.
- ✅ Put reusable field rules in `validators`, not in the screen's schema.
