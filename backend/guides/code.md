# Coding

## Source code

### Naming above all

The source code you write is intended for only two audiences

- other people,
- compiler/interpreter.

The compiler doesn't care about the naming, doesn't have to understand the semantics, therefore the readability and understandability are the most important aspects above all.

It's exactly like when two people from different countries trying to express themselves with language the other doesn't understand. Or even worse, they speak the same language and each of them are using different naming for the same things.

When you call something 'banana', it should be banana and not an orange.

### Learn to love old code

If it works, there is no need to refactor it. Refactoring a code that is old but checks out can be done over and over and forever.

Do you need to add functionality? Compose the code.

### Minimal, conscious, self-documenting

1. Less code is oftentimes better, than more code, if it does not sacrifice readability or comprehension. Smaller codebase is more maintainable and shorter snippets are faster to review and understand.
2. Avoid using one-liners if it hurts the readability

```js
// BAD
const articles = getArticles()
const filteredArticles = []
for (const article of articles) {
    if (isValid(article)) {
        filteredArticles.push(article)
    }
}
// GOOD
const filteredArticles = getArticles().filter(isValid)
```

As seen in the example, limiting local variables and imperative constructs usually leads to more readable code, that does not need comments and is easier to follow.

This practice is sometimes referred to as [💋 KISS](https://en.wikipedia.org/wiki/KISS_principle)

## Prefer libraries

Always prefer libraries above your code - you transfer the responsibility to the libraries, that usually are well tested

Get to know our libs!

- Logging. https://github.com/AckeeCZ/cosmas
- Configuration. https://github.com/AckeeCZ/configuru
- User notifications. https://github.com/AckeeCZ/enmail
- Message queues. https://github.com/AckeeCZ/fuqu
- Utilities. https://lodash.com/ (or FP variant), https://ramdajs.com/
- MySQL database. https://github.com/AckeeCZ/databless
- Authentication. https://github.com/AckeeCZ/authist
- HTTP Server. https://github.com/AckeeCZ/unicore
- ACL. https://github.com/AckeeCZ/axesor

## Typescript

1. Don't `export` if you don't need the thing exported, just because you think, you might need it in next commit or distant future.
2. Prefer `object`, `number` etc. to `Object`, `Number` types. [Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html#general-types)

### KISS [💋](https://en.wikipedia.org/wiki/KISS_principle)
#### Needless wrappers
```typescript
// BAD
const createFoo = ({ fooConfig }: typeof config) => {
    return new Foo(fooConfig);
};
const foo = createFoo(safeConfig);

// GOOD
const foo = new Foo(config.fooConfig);
```
Don't create wrappers when you don't need wrappers. You add structural and type overhead for nothing.

#### Needless lambdas
```typescript
// BAD
const flattenFoos = (data: Foo[][]): Foo[] => flatten(data);

// GOOD
const flattenFoos = flatten; // Just use flatten, you don't need your custom fn
```
Don't create lambdas just passing parameters around.


### Enums

Use [`PascalCase`](https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md#enum) and [singular](https://stackoverflow.com/questions/15755955/naming-of-enums-in-java-singular-or-plural/15756009#15756009)

```typescript
// BAD
enum Colors { Red, Blue }


interface Brush {
    color: Colors // Plural is wrong, brush has a single color
}
```

```typescript
// GOOD
enum Color { Red, Blue }
interface Brush {
    color: Color // Singular rocks
}
```

### Prefer `type` to `interface` for simple types
```typescript
// BAD
interface GetPizzas {
    (): Promise<Pizza[]>;
}
```

```typescript
// GOOD
type GetPizzas = () => Promise<Pizza[]>
```

### Install @types packages to devDependencies if possible

Most of the time, `@types` packages are not needed for the consumer of your module. Therefore, you should install the `@types` package as a [dev dependency (`npm i -D @types...`)](https://docs.npmjs.com/cli/install).

However, if you use the types from `@types` package and export them as a part of your module's interface, you have to install the `@types` package into dependencies, so that they are installed for the consumer of your module (`npm i @types...`).

- [Example on SO](https://stackoverflow.com/a/46011417)

## Node.js

### Use os.tmpdir() for temp files

Do not write temp dir location by your own, but rather use node's [`os.tmpdir()` function](https://nodejs.org/api/os.html#os_os_tmpdir) as it is a standard cross-platform solution respecting environment variables used for temp folder settings.

### Don't use `console` for logging

While handy for debugging, you should never settle for `console` methods (e.g. `log`, `error`, `trace`) for proper logging. Use one of the standardized solutions. That way, you will have a predictable and configurable behavior at your hand (e.g. you can setup different log levels and formats for different environments)

#### [Node.js debuglog](https://nodejs.org/api/util.html#util_util_debuglog_section)

Writes to stderr, if the debuglog is enabled via `NODE_DEBUG` env variable. Mainly used for debugging.

#### [`debug` module](https://www.npmjs.com/package/debug)

Used by many npm modules, colorful logger. Enabled via `DEBUG` env variable. Mainly used for debugging.

#### [`cosmas` module](https://www.npmjs.com/package/cosmas)

Ackee's custom-tailored logger based on [`pino`](https://www.npmjs.com/package/cosmas). Can be used for both debugging and logging.

### Don't log static messages

Messages that are always the same (e.g. `Function started`) have very little informational value. Most of the time, you can easily add additional data which will make the log entry more specific (and more useful).
