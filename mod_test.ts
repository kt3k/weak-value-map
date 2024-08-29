import { WeakValueMap } from "./mod.ts";
import { assertEquals, assertLess } from "@std/assert";

function largeObject() {
  return Array(10000).fill(0).map(() => () => {});
}

Deno.test("WeakValueMap", async () => {
  const map = new WeakValueMap<number | string, WeakKey>();
  const foo = largeObject();
  map.set("foo", foo);
  for (const i of Array(1000).keys()) {
    await new Promise((resolve) => setTimeout(resolve, 1));
    // Set a large object to the map without keeping the reference
    // This can be collected by the GC
    map.set(i, largeObject());
  }

  console.log([...map.keys()]);

  // some objects should be collected and finialized
  assertLess(map.size, 1001);

  // foo should be kept
  assertEquals(map.get("foo"), foo);
});
