# @kt3k/weak-value-map

> Map compatible object, which stores the values by weak references

## Install

```
npx jsr install @kt3k/weak-value-map
```

Or with Deno

```
deno add @kt3k/weak-value-map
```

### Usage

```ts
import { WeakValueMap } from "@kt3k/weak-value-map";
import { assert, assertFalse } from "@std/assert";

const wvm = new WeakValueMap();

let myObject = {/* some large object */};

wvm.set(1, myObject);

assert(wvm.has(1));
assert(wvm.get(1) === myObject);

myObject = null; // the object doesn't have reference anymore

// ... some time later

assertFalse(wvm.has(1));
assert(wvm.get(1) === undefined);
```

## License

MIT
