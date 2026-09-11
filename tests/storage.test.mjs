import test from 'node:test';
import assert from 'node:assert/strict';
import { universalStorage } from '../src/lib/storageManager.ts';

const StorageManager = universalStorage.constructor;

function fakeStorage(initial = {}) {
  const data = { ...initial };
  const control = { quota: false, blocked: false };
  const storage = Object.create(null);
  const sync = () => {
    for (const key of Object.keys(storage)) delete storage[key];
    for (const key of Object.keys(data)) Object.defineProperty(storage, key, { value: data[key], configurable: true, enumerable: true });
  };
  const readable = () => { if (control.blocked) throw new DOMException('Blocked fixture', 'SecurityError'); };
  const writable = () => { readable(); if (control.quota) throw new DOMException('Full fixture', 'QuotaExceededError'); };
  Object.defineProperties(storage, {
    length: { get() { readable(); return Object.keys(data).length; } },
    getItem: { value(key) { readable(); return Object.hasOwn(data, key) ? data[key] : null; } },
    setItem: { value(key, value) { writable(); data[key] = String(value); sync(); } },
    removeItem: { value(key) { readable(); delete data[key]; sync(); } },
    clear: { value() { readable(); for (const key of Object.keys(data)) delete data[key]; sync(); } },
  });
  sync();
  return { storage, control, data };
}

function fixture(initial = {}, configure = () => {}) {
  const session = fakeStorage(initial);
  const local = fakeStorage();
  configure(session, local);
  globalThis.window = { sessionStorage: session.storage, localStorage: local.storage };
  return { manager: new StorageManager(), session, local };
}

test('quota failure preserves favorites, current pack and unrelated entries', () => {
  const saved = { favorites: '["fixture-card"]', currentPack: '["fixture-pack"]', theme: 'dark', unrelated: 'keep' };
  const { manager, session } = fixture(saved);
  session.control.quota = true;
  assert.equal(manager.setItem('pokemon_session_cards', 'large fixture'), true);
  assert.deepEqual(session.data, saved);
  for (const [key, value] of Object.entries(saved)) assert.equal(manager.getItem(key), value);
  assert.equal(manager.getItem('pokemon_session_cards'), 'large fixture');
});

test('an already full session store remains readable on startup', () => {
  const { manager, session } = fixture({ favorites: 'saved fixture' }, session => { session.control.quota = true; });
  assert.equal(manager.getItem('favorites'), 'saved fixture');
  assert.equal(session.data.favorites, 'saved fixture');
});

test('failed updates shadow the old value without overwriting durable records', () => {
  const { manager, session } = fixture({ favorites: 'old fixture', theme: 'dark' });
  session.control.quota = true;
  manager.setItem('favorites', 'new fixture');
  assert.equal(manager.getItem('favorites'), 'new fixture');
  assert.equal(session.data.favorites, 'old fixture');
  assert.equal(manager.getItem('theme'), 'dark');
  assert.equal(manager.getStorageType(), 'memory');
});

test('storage recovery persists a later update and clears its memory fallback', () => {
  const { manager, session } = fixture({ favorites: 'old fixture' });
  session.control.quota = true;
  manager.setItem('favorites', 'temporary fixture');
  session.control.quota = false;
  manager.setItem('favorites', 'durable fixture');
  assert.equal(session.data.favorites, 'durable fixture');
  assert.equal(manager.getItem('favorites'), 'durable fixture');
  assert.equal(manager.getStorageType(), 'session');
});

test('empty strings remain present in memory fallback', () => {
  const { manager } = fixture({}, (session, local) => { session.control.blocked = true; local.control.blocked = true; });
  manager.setItem('empty', '');
  assert.equal(manager.getItem('empty'), '');
  assert.deepEqual(manager.getAllKeys(), ['empty']);
});

test('a blocked session store uses existing local storage without clearing it', () => {
  const { manager, local } = fixture({}, (session, local) => {
    session.control.blocked = true;
    local.storage.setItem('favorites', 'local fixture');
  });
  assert.equal(manager.getItem('favorites'), 'local fixture');
  manager.setItem('currentPack', 'pack fixture');
  assert.equal(local.data.favorites, 'local fixture');
  assert.equal(local.data.currentPack, 'pack fixture');
});

test('an availability probe never overwrites an existing key', () => {
  const { session } = fixture({ __storage_test__: 'existing fixture' });
  assert.equal(session.data.__storage_test__, 'existing fixture');
});

test('enumeration combines durable entries and pending memory updates', () => {
  const { manager, session } = fixture({ favorites: 'saved fixture' });
  session.control.quota = true;
  manager.setItem('currentPack', 'temporary fixture');
  assert.deepEqual(new Set(manager.getAllKeys()), new Set(['favorites', 'currentPack']));
});

test('removing a pending update also removes its stale durable value', () => {
  const { manager, session } = fixture({ favorites: 'saved fixture' });
  session.control.quota = true;
  manager.setItem('favorites', 'temporary fixture');
  manager.removeItem('favorites');
  assert.equal(manager.getItem('favorites'), null);
  assert.equal(session.storage.getItem('favorites'), null);
});

test('failed removal cannot resurrect a value when storage access returns', () => {
  const { manager, session } = fixture({ favorites: 'saved fixture' });
  session.control.blocked = true;
  manager.removeItem('favorites');
  session.control.blocked = false;
  assert.equal(manager.getItem('favorites'), null);
  assert.equal(session.data.favorites, 'saved fixture');
  assert.deepEqual(manager.getAllKeys(), []);
});

test('explicit clear removes durable entries and memory updates', () => {
  const { manager, session } = fixture({ favorites: 'saved fixture' });
  session.control.quota = true;
  manager.setItem('currentPack', 'temporary fixture');
  manager.clear();
  assert.deepEqual(manager.getAllKeys(), []);
  assert.deepEqual(session.data, {});
});

test('subscribers learn when persistence becomes temporary and when it recovers', () => {
  const { manager, session } = fixture();
  const statuses = [];
  const unsubscribe = manager.subscribe(() => statuses.push(manager.getStorageType()));
  session.control.quota = true;
  manager.setItem('favorites', 'temporary fixture');
  session.control.quota = false;
  manager.setItem('favorites', 'durable fixture');
  assert.deepEqual(statuses, ['memory', 'session']);
  unsubscribe();
  session.control.quota = true;
  manager.setItem('favorites', 'another fixture');
  assert.deepEqual(statuses, ['memory', 'session']);
});
