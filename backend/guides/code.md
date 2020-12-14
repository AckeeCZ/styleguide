# Coding

## Source code

### Naming above all

The source code you write is intended for only two audiences

- other people,
- compiler/interpreter.

The compiler doesn't care about the naming, doesn't have to understand the semantics, therefore the readability and understandability are the most important aspects above all.

It's exactly like when two people from different countries trying to express themselves with language the other doesn't understand. Or even worse, they speak the same language and each of them are using different naming for the same things.

When you call something 'banana', it should be banana and not an orange.

### Leave your code better than you found it

Suggested by the [The Boy Scout Rule](https://deviq.com/boy-scout-rule/), if you change some code and you can improve it beyond your minimal required change, you should do so. Every long running project suffers from an increasing technical debt and usually it is not the case that you can focus solely on that. Instead gradually as it appears in the codebase, try to improve it piece by piece.

Mind that it says _better than you found it_, not _different to what you found_. Boy Scout rule is not a tool to rewrite the code you did not write in order to change it the way you would. When unsure always try to advocate what are the changes that the code will benefit from your refactoring (e.g. enclose private property, remove shared state that might cause race conditions, etc)

However if it works and there is nothing you can describe that would improve the code, probably you should keep it as it is to avoid endless refactoring.

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

Prefer libraries above your code - you transfer the responsibility to the libraries, that usually are well tested

Get to know our libs!

- Logging. https://github.com/AckeeCZ/cosmas
- Configuration. https://github.com/AckeeCZ/configuru
- User notifications. https://github.com/AckeeCZ/enmail
- Message queues. https://github.com/AckeeCZ/fuqu
- MySQL database. https://github.com/AckeeCZ/databless
- Authentication. https://github.com/AckeeCZ/authist
- HTTP Server. https://github.com/AckeeCZ/unicore
- ACL. https://github.com/AckeeCZ/axesor

First, check if the functionality is not covered by the standard library.

The less experienced programmer, the more important this rule is, because their implementation is usually buggy, takes time and is in unreadable form. To prevent all of these, you should always refer to an existing solution to pass the responsibility to someone else or discuss.

## Typescript

1. Don't `export` if you don't need the thing exported, just because you think, you might need it in next commit or distant future, although consider exporting complex object arguments, if they allow users to construct arguments beforehand, instead of inferring the type from the function.
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

### Use either `type` vs `interface` consciously

1. Type is usually more versatile. You can use it to alias primitives, tuples, complex types and compose types with union and intersection. If you need any of that, use type.
2. Interfaces have deceleration merging (you can define the same interface twice to add attributes), but you cannot change a declared type. If you need others to extend your types, use interface.
3. Both can be be implemented by classes, unless the `type` is a union of other types. If you want to stay in the safe zone, use `interface`, which can always be implemented by a class.
4. If you have no preference, use whatever feels more natural (e.g. function type with `interface` is object with `()` property, which is nothing like you declare a function most of the time in JS. `type` annotation however feels way more natural, because it is very similar to arrow function syntax).

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
