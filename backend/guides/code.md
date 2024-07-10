# Coding

## Source code

The source code you write is intended for only two audiences

- other people,
- compiler/interpreter.

The compiler doesn't care about the naming, doesn't have to understand the semantics, therefore the readability and understandability are the most important aspects above all.

It's exactly like when two people from different countries trying to express themselves with language the other don't understand. Or even worse, they speak the same language and each of them are using different naming for the same things.

When you call something 'banana', it should be banana and not an orange.

### Naming conventions

People say that naming is the hardest problem in computer programming, and we can agree with this statement. 
Having different naming across projects, using different cases for same things can be not only confusing but also annoying for new members of the team.
That's why we believe having at least a minimal set of rules is a QoL improvement for a development process.
  
#### 1. Expressions returning boolean
Variables, functions and method should be prefixed with `is`, `are`, `has`, `have` if it returns boolean. 
This will help differentiate the boolean operators and the rest, for example casting or converting functions.

```typescript
// BAD
const nullish = (x): boolean => { /* ... */ }

if (nullish(x)) {
  //...
}

// GOOOD
const isNullish = (x): boolean =>  { /* ... */ }

if (isNullish(x)) {
  //...
}
```

#### 2. Time and dates
Use `time` suffix for date fields that includes time (database `timestamp` / `datetime`), `date` suffix for fields 
where we don't care about  the time (database `string` or `date` field)

```typescript
interface Event {
    // BAD
    start: Date
    
    // GOOD when we care about the time
    startTime: Date
    // GOOD when we care only about date 
    startDate: Date
}
```

#### 3. Errors
All errors has `Error` suffix

```typescript
// BAD
export class Unauthorized extends Error {}
// GOOD
export class UnauthorizedError extends Error {}
```

#### 4. Functions with general names
General functions (like utils) should be prefixed with word(s) that make(s) clear what is purpose of them. This can
help developers understand the code and distinguish between similarly named functions in the large codebases.

```typescript
const results = Promise.all([
  // ...
])

// BAD
const { errors, values } = split(results)

// GOOD 1
const { errors, values } = util.promise.splitResults(results)
// GOOD 2
const { errors, values } = splitPromiseResults(results)
```

#### 5. Variables in function context
Name variables with respect to context where they are used. Do not expose the inner context to outside if not necessary.

```typescript
/** CASE 1: Function parameters **/
const someFunction = () => {
  const user = authService.getSignedUser() // ...
  return createComment('comment', user)
}

// BAD 
const createComment = (text: string, user: User) => { /* ... */}
// GOOD
const createComment = (text: string, author: User) => { /* ... */}


/** CASE 2: Object properties **/
const assignUserInfo = () => {
  // Business logic, at the end we want to check the uniqueness of assigned values
  const uniqueEmail = /* ... */
  const uniquePhone = /* ... */

// BAD  - Uniqueness is an implementation detail
  return {
    uniqueEmail,
    uniquePhone
  }

// GOOD
  return {
    email: uniqueEmail,      
    phoneNumber: uniquePhone
  }
}
```

#### 6. Detailed naming over abstract naming 
Prefer the most concrete naming for variables instead of abstract name. Try to avoid `result` or `response` variables if 
it really is not an result or response (not an object you ask for, but execution result / response)

```typescript
/** Example 1 **/
const fetchUser = (id: string): Promise<User | undefined>

// BAD
const result = await fetchUser('1')
// GOOD
const user = await fetchUser('1')

/** Example 2 **/
// OK - This referes to promise result, not user object 
const results = Promise.allSettled([
  fetchUser('1'),
  fetchUser('2')
])
// GOOD - Better than just result 
const fetchUserResults = Promise.allSettled([
  fetchUser('1'),
  fetchUser('2')
])
```

#### 7. Typescript interface fields 
When naming a field inside of interface or object, don't repeat the object or interface or object name and keep the
fields in the context of current scope.

```typescript
// BAD
interface User {
  userId: string
  userEmail
} 
// GOOD
interface User {
  id: string
  email
} 
```

#### 8. Typescript template parameters
Use descriptive names prefixed with `T` for template parameters of generics

```typescript
// BAD
interface Repository<T> {
    get(id: number): T | undefined
    create(data: T): void
}

interface Response<S, T, U> {
    status: S
    data: T
    error: U
}

// GOOD
interface Repository<TEntity> {
    get(id: number): TEntity | undefined
    create(data: TEntity): void
}

interface Response<TStatus, TResult, TError> {
    status: TStatus
    error: TError
    data: TResult
}
```

#### 9. Constants and typescript enums
Use *CONSTANT_CASE* for global constants AND PascalCase for Typescript enums

```typescript
// BAD
const maxCharacters = 10

enum Constaints {
  maxCharacters = 10
}

// GOOD
const MAX_CHARACTERS = 10

enum Constrains {
  MaxCharacters = 10
}
```

### Leave your code better than you found it

Suggested by the [The Boy Scout Rule](https://deviq.com/boy-scout-rule/), if you change some code and you can improve it beyond your minimal required change, you should do so. Every long running project suffers from an increasing technical debt, and usually it is not the case that you can focus solely on that. Instead, gradually as it appears in the codebase, try to improve it piece by piece.

Mind that it says _better than you found it_, not _different to what you found_. Boy Scout rule is not a tool to rewrite the code you did not write in order to change it the way you would. When unsure always try to advocate what are the changes that the code will benefit from your refactoring (e.g. enclose private property, remove shared state that might cause race conditions, etc)

However, if it works and there is nothing you can describe that would improve the code, probably you should keep it as it is to avoid endless refactoring.

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
const validArticles = getArticles().filter(isValid)
```

As seen in the example, limiting local variables and imperative constructs usually leads to more readable code, that does not need comments and is easier to follow.

This practice is sometimes referred to as [💋 KISS](https://en.wikipedia.org/wiki/KISS_principle)

## Prefer libraries

Prefer libraries above your code - you transfer the responsibility to the libraries, that usually are well tested. 

The current list of our preferred tools and libraries is reflected in our [Tech radar](https://radar.thoughtworks.com/?sheetId=https://docs.google.com/spreadsheets/d/11FExRfLBnZCM24c2MMPp8SN7U_VqaknZRHnTsAeDYt4/edit&sheetName=Current).

Get to know our libs!

- Node app setup tool https://github.com/AckeeCZ/create-node-app
- Configuration https://github.com/AckeeCZ/configuru
- HTTP Server https://github.com/AckeeCZ/unicore
- Message queues https://github.com/AckeeCZ/fuqu
- Caching utils https://github.com/AckeeCZ/kesha
- Node healthz https://github.com/AckeeCZ/node-healthz

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


### Use either `type` vs `interface` consciously

1. Type is usually more versatile. You can use it to alias primitives, tuples, complex types and compose types with union and intersection. If you need any of that, use type.
2. Interfaces have deceleration merging (you can define the same interface twice to add attributes), but you cannot change a declared type. If you need others to extend your types, use interface.
3. Both can be implemented by classes, unless the `type` is a union of other types. If you want to stay in the safe zone, use `interface`, which can always be implemented by a class.
4. If you have no preference, use whatever feels more natural (e.g. function type with `interface` is object with `()` property, which is nothing like you declare a function most of the time in JS. `type` annotation however feels way more natural, because it is very similar to arrow function syntax).

```typescript
// BAD
interface GetPizzas {
    (): Promise<Pizza[]>;
}

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

#### [`pino` module](https://www.npmjs.com/package/pino)

Logger based on [`pino`](https://www.npmjs.com/package/cosmas). Can be used for both debugging and logging.

### Don't log static messages

Messages that are always the same (e.g. `Function started`) have very little informational value. Most of the time, you can easily add additional data which will make the log entry more specific (and more useful).
