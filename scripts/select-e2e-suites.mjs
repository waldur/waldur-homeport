#!/usr/bin/env node
// Names the E2E areas a merge request can affect, as E2E_SUITES for the
// "Trigger integration tests" bridge (waldur/waldur-homeport#515). The
// waldur-integration-testing pipeline cannot see this repository's diff, so
// the choice is made here; there each job runs only when one of its areas
// (its E2E_AREA) or "all" is named. Prints one dotenv line.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Screens that only one family of suites drives. A change confined to them
// runs those suites; the names are integration-testing's areas.
const AREAS = {
  openstack: ['src/openstack/'],
  vmware: ['src/vmware/'],
  matrix: ['src/matrix/'],
  calls: ['src/proposals/', 'src/reviewer/'],
};

// Outside src/, these change the image every suite runs on.
const IMAGE_FILES = [
  'locales/',
  'docker/',
  'Dockerfile',
  'index.html',
  'package.json',
  'yarn.lock',
  'vite.config.ts',
  'vite-plugin-react-displayname.ts',
  'tsconfig.json',
  'typings.d.ts',
  'generate-filters.cjs',
  'generate-filters-config.yaml',
];

const TEST_FILE =
  /(\.test\.tsx?|\.stories\.tsx)$|\/__snapshots__\/|^src\/test\//;

// "all", "none" or a space-separated list of areas.
export function selectE2eSuites(files) {
  const areas = new Set();
  for (const file of files.filter(Boolean)) {
    if (file.startsWith('src/')) {
      if (TEST_FILE.test(file)) continue;
      const area = Object.keys(AREAS).find((name) =>
        AREAS[name].some((root) => file.startsWith(root)),
      );
      if (!area) return 'all';
      areas.add(area);
    } else if (IMAGE_FILES.some((prefix) => file.startsWith(prefix))) {
      return 'all';
    }
  }
  return [...areas].sort().join(' ') || 'none';
}

function changedFiles(base) {
  const diff = () =>
    execFileSync('git', ['diff', '--name-only', base, 'HEAD'], {
      encoding: 'utf8',
    });
  try {
    return diff();
  } catch {
    // A shallow clone may not hold the merge base; fetch just that commit.
    execFileSync('git', ['fetch', '--quiet', '--depth=1', 'origin', base]);
    return diff();
  }
}

// Every pipeline that is not a merge request -- develop, a tag -- is where the
// whole suite is the safety net, and so is a diff that cannot be read.
export function suitesForPipeline(env, readChanges = changedFiles) {
  const base = env.CI_MERGE_REQUEST_DIFF_BASE_SHA;
  if (!base) return 'all';
  try {
    return selectE2eSuites(readChanges(base).split('\n'));
  } catch (error) {
    console.error(`select-e2e-suites: ${error.message}; running every suite`);
    return 'all';
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`E2E_SUITES=${suitesForPipeline(process.env)}`);
}
