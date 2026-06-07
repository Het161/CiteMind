import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getSitesLoadErrorMessage,
  normalizeSitesResponse,
} from './dashboardState.js';

test('normalizeSitesResponse returns fetched site arrays', () => {
  const sites = [{ id: 'site-1', name: 'CiteMind' }];

  assert.equal(normalizeSitesResponse(sites), sites);
});

test('normalizeSitesResponse falls back to an empty array for malformed data', () => {
  assert.deepEqual(normalizeSitesResponse(null), []);
  assert.deepEqual(normalizeSitesResponse({ sites: [] }), []);
});

test('getSitesLoadErrorMessage explains expired sessions', () => {
  assert.match(
    getSitesLoadErrorMessage({ response: { status: 401 } }),
    /session expired/i
  );
});

test('getSitesLoadErrorMessage explains unreachable APIs', () => {
  assert.match(getSitesLoadErrorMessage({ request: {} }), /backend/i);
});
