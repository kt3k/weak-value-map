/**
 * Cache values with weak reference with values
 */
export class WeakValueMap<K, V extends WeakKey> implements Map<K, V> {
  readonly #map = new Map<K, WeakRef<V>>()
  readonly #registry = new FinalizationRegistry<K>((key) => {
    this.#map.delete(key)
  });
  [Symbol.toStringTag] = "WeakValueMap"

  constructor(iterable: Iterable<[K, V]> = []) {
    for (const [k, v] of iterable) {
      this.set(k, v)
    }
  }

  clear(): void {
    for (const key of this.keys()) {
      this.delete(key)
    }
  }

  delete(key: K): boolean {
    const ref = this.#map.get(key)

    if (ref) {
      this.#map.delete(key)
      this.#registry.unregister(ref)
      if (ref.deref() === undefined) {
        return false
      }
      return true
    }
    return false
  }

  forEach(
    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
    // deno-lint-ignore no-explicit-any
    thisArg?: any,
  ): void {
    this.#map.forEach((ref, k) => {
      callbackfn(ref.deref()!, k, thisArg)
    })
  }

  get(key: K): V | undefined {
    const ref = this.#map.get(key)
    if (ref === undefined) {
      return undefined
    }
    const value = ref.deref()
    if (value === undefined) {
      this.#map.delete(key)
      this.#registry.unregister(ref)
      return undefined
    }

    return value
  }

  has(key: K): boolean {
    const ref = this.#map.get(key)
    if (ref === undefined) {
      return false
    }
    const value = ref.deref()
    if (value === undefined) {
      this.#map.delete(key)
      this.#registry.unregister(ref)
      return false
    }

    return true
  }

  set(key: K, value: V): this {
    const prevRef = this.#map.get(key)
    if (prevRef) {
      this.#registry.unregister(prevRef)
    }
    const ref = new WeakRef(value)
    this.#map.set(key, ref)
    this.#registry.register(value, key, ref)
    return this
  }

  get size(): number {
    // This is not accurate, but it's the best we can do
    return this.#map.size
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries()
  }

  *entries(): IterableIterator<[K, V]> {
    for (const [k, ref] of this.#map.entries()) {
      const v = ref.deref()
      if (v === undefined) {
        this.#map.delete(k)
        this.#registry.unregister(ref)
        continue
      }
      yield [k, v]
    }
  }

  *keys(): IterableIterator<K> {
    for (const [k, ref] of this.#map.entries()) {
      const v = ref.deref()
      if (v === undefined) {
        this.#map.delete(k)
        this.#registry.unregister(ref)
        continue
      }
      yield k
    }
  }

  *values(): IterableIterator<V> {
    for (const ref of this.#map.values()) {
      const v = ref.deref()
      if (v === undefined) {
        continue
      }
      yield v
    }
  }
}
