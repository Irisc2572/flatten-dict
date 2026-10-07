# flatten-dict

Turn nested dicts into flat dot-path keys, and back. One function to flatten, one to unflatten, a single separator argument.

```js
import { flatten, unflatten } from 'flatten-dict';

const flat = flatten({ a: { b: { c: 1 } } });
// { 'a.b.c': 1 }

const nested = unflatten({ 'a.b.c': 1 });
// { a: { b: { c: 1 } } }
```

## Why

Environment-variable loaders, URL query strings, and many config stores only accept a flat `key=value` surface. This library is the small piece of glue that turns a nested config into something those stores can carry, and then rebuilds the nesting on the other side. The trade-off is simplicity over feature breadth: one separator string, plain-object dicts only.

## Edge cases

- **Arrays are leaves.** `flatten({ a: { b: [1, 2] } })` produces `{ 'a.b': [1, 2] }` — the array is not exploded into `a.b.0`, `a.b.1`. If you need that, this is the wrong library.
- **Only plain objects recurse.** Instances of classes, `Date`, `Map`, etc. are treated as terminal values.
- **Empty nested objects survive.** `{ 'a.b': {} }` round-trips; we don't silently drop empty dicts.
- **Conflicting shallow/deep keys.** If a flat dict contains both `a.b` and `a.b.c`, whichever is assigned last wins. `unflatten` is order-insensitive for non-conflicting keys, but conflicts resolve by input order — pick one or the other.

## API

### `flatten(input, separator='.')`

- `input` — a plain object, arbitrarily nested.
- `separator` — non-empty string inserted between path segments.
- Returns a new flat object whose keys are the concatenated paths to each leaf.
- Throws `TypeError` if `separator` is empty or not a string.

### `unflatten(input, separator='.')`

- `input` — a flat object whose keys are path strings.
- `separator` — non-empty string used to split keys.
- Returns a new nested object.
- Throws `TypeError` if `separator` is empty or not a string.

## Run the tests

```sh
node --test
```

## Design notes

The window stores values eagerly rather than keeping running aggregates. Running
sums drift with floating point over long streams, and recomputing from a small
buffer is cheap enough that the drift is not worth the speed.

