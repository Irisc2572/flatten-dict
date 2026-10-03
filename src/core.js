/**
 * @module core
 *
 * Internal implementation of flatten/unflatten for arbitrary nested dicts.
 * Pure functions, zero dependencies.
 */

const _isPlainObject = (v) =>
  v !== null &&
  typeof v === 'object' &&
  (Object.getPrototypeOf(v) === Object.prototype ||
   Object.getPrototypeOf(v) === null);

/**
 * Convert an arbitrarily nested object into a single-level dict whose keys are
 * the concatenated path segments of each leaf value.
 *
 * We only recurse through plain objects ({} or Object.create(null)). Arrays
 * and other built-ins are treated as leaves — flattening arrays is a separate
 * concern and would change the shape of the result for callers who use arrays
 * as list values, so it is deliberately out of scope here.
 *
 * @param {Record<string, *>} input
 * @param {string} [separator='.'] - the string inserted between path segments
 * @returns {Record<string, *>} a new flat object
 */
export function flatten(input, separator = '.') {
  if (typeof separator !== 'string' || separator.length === 0) {
    throw new TypeError('separator must be a non-empty string');
  }
  const out = {};
  const walk = (node, prefix) => {
    if (_isPlainObject(node)) {
      const keys = Object.keys(node);
      if (keys.length === 0) {
        // Preserve empty dicts as a leaf instead of dropping them entirely,
        // which would silently lose data on round-trip.
        out[prefix] = {};
        return;
      }
      for (const key of keys) {
        walk(node[key], prefix === '' ? key : prefix + separator + key);
      }
      return;
    }
    out[prefix] = node;
  };
  walk(input, '');
  return out;
}

/**
 * Reconstruct a nested object from a flat dict whose keys are path strings.
 *
 * Iterating in key order is safe because unflatten is insensitive to order:
 * whether 'a' arrives before or after 'a.b' is handled by the same assignment
 * logic — the deeper key descends, the shallower one fills an empty object
 * in. No stable sort is required.
 *
 * @param {Record<string, *>} input
 * @param {string} [separator='.']
 * @returns {Record<string, *>}
 */
export function unflatten(input, separator = '.') {
  if (typeof separator !== 'string' || separator.length === 0) {
    throw new TypeError('separator must be a non-empty string');
  }
  const root = {};
  for (const flatKey of Object.keys(input)) {
    const segments = String(flatKey).split(separator);
    let node = root;
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i];
      const next = node[seg];
      if (!_isPlainObject(next)) {
        node[seg] = {};
      }
      node = node[seg];
    }
    node[segments[segments.length - 1]] = input[flatKey];
  }
  return root;
}
