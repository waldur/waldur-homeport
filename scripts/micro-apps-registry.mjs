#!/usr/bin/env node
// Writes micro-apps.json, the registry the quick shortcuts menu reads: one
// entry per micro-app, from the `waldur` block of its package.json (see
// docs/micro-apps.md, "Listing an app in the quick shortcuts").
//
//   node scripts/micro-apps-registry.mjs dist > dist/micro-apps.json
//
// With a dist directory it lists the apps that directory holds, the way
// docker/entrypoint.sh finds them for nginx (dist/<name>/index.orig.html),
// so the registry never names an app the image left out (waldur.deploy:
// false). Without one (the dev server) it lists every apps/* member.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPS = path.join(ROOT, 'apps');

const asStrings = (value) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];

/** One registry entry, or null for an app that asks not to be listed. */
const entryOf = (name) => {
  const manifest = path.join(APPS, name, 'package.json');
  if (!existsSync(manifest)) return null;
  const waldur = JSON.parse(readFileSync(manifest, 'utf8')).waldur ?? {};
  // An app without a title has not opted in to the menu.
  if (typeof waldur.title !== 'string' || !waldur.title) return null;
  const visibleTo = waldur.visibleTo ?? {};
  return {
    name,
    title: waldur.title,
    description:
      typeof waldur.description === 'string' ? waldur.description : '',
    visibleTo: {
      features: asStrings(visibleTo.features),
      roles: asStrings(visibleTo.roles),
      staffOnly: visibleTo.staffOnly === true,
    },
  };
};

/** The registry for the apps in `distDir`, or for every app without one. */
export const collectMicroApps = (distDir) => {
  const names = distDir
    ? readdirSync(distDir, { withFileTypes: true })
        .filter(
          (entry) =>
            entry.isDirectory() &&
            existsSync(path.join(distDir, entry.name, 'index.orig.html')),
        )
        .map((entry) => entry.name)
    : existsSync(APPS)
      ? readdirSync(APPS, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
      : [];
  return {
    apps: names
      .sort()
      .map(entryOf)
      .filter((entry) => entry !== null),
  };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const distDir = process.argv[2] ? path.resolve(process.argv[2]) : undefined;
  process.stdout.write(
    `${JSON.stringify(collectMicroApps(distDir), null, 2)}\n`,
  );
}
