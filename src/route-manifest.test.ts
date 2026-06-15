import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { states } from './states';

/**
 * Sanity checks over the composed route tree, doubling as the route
 * manifest exporter for the UI crawler in waldur-integration-testing.
 *
 * When ROUTE_MANIFEST_OUT is set, the registry is serialized to JSON:
 *
 *   ROUTE_MANIFEST_OUT=/tmp/routes.json yarn vitest run src/route-manifest.test.ts
 *
 * Each entry carries the full URL pattern (parent chain composed, params
 * normalized to :name), effective auth/anonymous flags, and the feature
 * gates inherited down the state tree, so an external crawler can decide
 * what is reachable without duplicating UI-Router semantics.
 */

interface ManifestEntry {
  name: string;
  abstract: boolean;
  parent: string | null;
  redirectTo: string | null;
  /** Composed path pattern with params normalized to `:name`. */
  path: string;
  pathParams: string[];
  queryParams: string[];
  /** Effective: true if this state or any ancestor requires auth. */
  auth: boolean;
  /** Effective: true if this state or any ancestor is anonymous-only. */
  anonymous: boolean;
  /** Feature gates of this state and its ancestors. */
  features: string[];
  /**
   * True if this state or an ancestor declares data.permissions guards.
   * The predicates themselves cannot be serialized; a crawler should
   * treat an error page on a guarded state as gating, not breakage.
   */
  guarded: boolean;
}

const byName = new Map(states.filter((s) => s.name).map((s) => [s.name, s]));

const parentOf = (name: string): string | null => {
  const state = byName.get(name);
  if (!state) return null;
  if (typeof state.parent === 'string') return state.parent;
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(0, dot) : null;
};

const chainOf = (name: string): string[] => {
  const chain: string[] = [];
  let current: string | null = name;
  while (current) {
    if (chain.includes(current)) {
      throw new Error(`Parent cycle detected at state "${current}"`);
    }
    chain.unshift(current);
    current = parentOf(current);
  }
  return chain;
};

const PARAM_RE = /\{([A-Za-z_]\w*)(?::[^}]*)?\}|[:*]([A-Za-z_]\w*)/g;

const splitUrl = (url: string) => {
  const [path = '', query = ''] = url.split('?');
  const pathParams: string[] = [];
  const normalizedPath = path.replace(PARAM_RE, (_m, curly, plain) => {
    const param = curly ?? plain;
    pathParams.push(param);
    return `:${param}`;
  });
  const queryParams = query
    .split('&')
    .map((q) =>
      q
        .trim()
        .replace(/^\{/, '')
        .replace(/(?::[^}]*)?\}$/, ''),
    )
    .filter(Boolean);
  return { path: normalizedPath, pathParams, queryParams };
};

const buildEntry = (name: string): ManifestEntry => {
  const state = byName.get(name);
  const chain = chainOf(name);
  let path = '';
  const pathParams: string[] = [];
  const queryParams: string[] = [];
  const features: string[] = [];
  let auth = false;
  let anonymous = false;
  let guarded = false;
  for (const link of chain) {
    const linkState = byName.get(link);
    const parsed = splitUrl((linkState.url as string) || '');
    path += parsed.path;
    pathParams.push(...parsed.pathParams);
    queryParams.push(...parsed.queryParams);
    if (linkState.data?.feature) features.push(linkState.data.feature);
    if (linkState.data?.auth) auth = true;
    if (linkState.data?.anonymous) anonymous = true;
    if (linkState.data?.permissions?.length) guarded = true;
  }
  return {
    name,
    abstract: Boolean(state.abstract),
    parent: parentOf(name),
    redirectTo: typeof state.redirectTo === 'string' ? state.redirectTo : null,
    path: path || '/',
    pathParams,
    queryParams,
    auth,
    anonymous,
    features,
    guarded,
  };
};

const buildManifest = (): ManifestEntry[] =>
  [...byName.keys()].sort().map(buildEntry);

describe('route manifest', () => {
  it('has unique state names', () => {
    const names = states.map((s) => s.name).filter(Boolean);
    expect(new Set(names).size).toBe(names.length);
  });

  it('resolves every parent reference', () => {
    const missing = [...byName.keys()]
      .map((name) => [name, parentOf(name)] as const)
      .filter(([, parent]) => parent && !byName.has(parent));
    expect(missing).toEqual([]);
  });

  it('composes a URL for every concrete state', () => {
    const manifest = buildManifest();
    expect(manifest.length).toBeGreaterThan(100);
    const broken = manifest.filter((entry) => !entry.abstract && !entry.path);
    expect(broken).toEqual([]);
  });

  it('exports the manifest when ROUTE_MANIFEST_OUT is set', () => {
    const out = process.env.ROUTE_MANIFEST_OUT;
    if (!out) return;
    const target = isAbsolute(out) ? out : resolve(process.cwd(), out);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, JSON.stringify(buildManifest(), null, 2) + '\n');
  });
});
