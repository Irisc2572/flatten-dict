import { test } from 'node:test';
import assert from 'node:assert/strict';

import { flatten, unflatten } from '../src/index.js';

test('flatten: basic nesting', () => {
  assert.deepEqual(
    flatten({ a: { b: { c: 1 } } }),
    { 'a.b.c': 1 }
  );
});

test('flatten: multiple branches', () => {
  assert.deepEqual(
    flatten({ a: { b: 1 }, c: 2 }),
    { 'a.b': 1, 'c': 2 }
  );
});

test('flatten: custom separator', () => {
  assert.deepEqual(
    flatten({ a: { b: { c: 3 } } }, '/'),
    { 'a/b/c': 3 }
  );
});

test('flatten: treats arrays as leaves', () => {
  assert.deepEqual(
    flatten({ a: { b: [1, 2, 3] } }),
    { 'a.b': [1, 2, 3] }
  );
});

test('flatten: null and undefined preserved as leaves', () => {
  assert.deepEqual(
    flatten({ a: { b: null, c: undefined } }),
    { 'a.b': null, 'a.c': undefined }
  );
});

test('flatten: preserves empty dict as a leaf', () => {
  assert.deepEqual(
    flatten({ a: { b: {} } }),
    { 'a.b': {} }
  );
});

test('flatten: rejects empty separator', () => {
  assert.throws(() => flatten({ a: 1 }, ''), TypeError);
});

test('flatten: rejects non-string separator', () => {
  assert.throws(() => flatten({ a: 1 }, 1), TypeError);
});

test('unflatten: basic round trip', () => {
  assert.deepEqual(
    unflatten({ 'a.b.c': 1, 'd': 2 }),
    { a: { b: { c: 1 } }, d: 2 }
  );
});

test('unflatten: custom separator', () => {
  assert.deepEqual(
    unflatten({ 'a/b/c': 9 }, '/'),
    { a: { b: { c: 9 } } }
  );
});

test('unflatten: deep key before shallow key', () => {
  assert.deepEqual(
    unflatten({ 'a.b.c': 1, 'a.b': 2 }),
    { a: { b: 2 } }
  );
});

test('unflatten: shallow key before deep key', () => {
  assert.deepEqual(
    unflatten({ 'a.b': 2, 'a.b.c': 1 }),
    { a: { b: { c: 1 } } }
  );
});

test('unflatten: rejects empty separator', () => {
  assert.throws(() => unflatten({ 'a': 1 }, ''), TypeError);
});

test('unflatten: handles empty input', () => {
  assert.deepEqual(unflatten({}), {});
});

test('round trip: nested dict with mixed types', () => {
  const original = {
    user: {
      name: 'ada',
      meta: { tags: ['x', 'y'], count: 2 },
      empty: {}
    },
    top: 3
  };
  assert.deepEqual(unflatten(flatten(original)), original);
});
