import type { HpcJob, HpcJobSpecRequest, HpcSoftware } from 'waldur-js-client';

import type { BadgeVariant } from 'waldur-ui';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';

/** Slurm states in which a job still changes on its own. */
const ACTIVE_JOB_STATES = [
  'PENDING',
  'RUNNING',
  'CONFIGURING',
  'COMPLETING',
  'REQUEUED',
  'RESIZING',
  'SUSPENDED',
];

/** Slurm states from which a job can still be cancelled from Waldur. */
const CANCELLABLE_JOB_STATES = ['PENDING', 'RUNNING'];

const SUCCESS_STATES = ['COMPLETED'];
const DANGER_STATES = [
  'FAILED',
  'NODE_FAIL',
  'OUT_OF_MEMORY',
  'TIMEOUT',
  'BOOT_FAIL',
  'DEADLINE',
  'PREEMPTED',
];

/**
 * Slurm reports a cancelled job as "CANCELLED by 1234" and FirecREST may pass
 * that through verbatim; only the leading word is the state.
 */
/** How often job lists and output refresh while a job is pending or running. */
export const JOB_POLL_INTERVAL = 10_000;

export const normalizeJobState = (state?: string | null): string =>
  (state || '').trim().split(/[\s+]/)[0].toUpperCase();

export const isActiveJobState = (state?: string | null): boolean =>
  ACTIVE_JOB_STATES.includes(normalizeJobState(state));

export const isCancellableJobState = (state?: string | null): boolean =>
  CANCELLABLE_JOB_STATES.includes(normalizeJobState(state));

export const hasActiveJobs = (jobs?: Array<{ state: string }>): boolean =>
  Boolean(jobs?.some((job) => isActiveJobState(job.state)));

export const getJobStateVariant = (state?: string | null): BadgeVariant => {
  const normalized = normalizeJobState(state);
  if (normalized === 'RUNNING') return 'primary';
  if (ACTIVE_JOB_STATES.includes(normalized)) return 'warning';
  if (SUCCESS_STATES.includes(normalized)) return 'success';
  if (DANGER_STATES.includes(normalized)) return 'danger';
  return 'neutral';
};

/** Seconds as Slurm prints them: [D-]HH:MM:SS. */
export const formatElapsed = (seconds?: number | null): string | null => {
  if (seconds === null || seconds === undefined || seconds < 0) return null;
  const total = Math.floor(seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  return days ? `${days}-${clock}` : clock;
};

/** A partition's time limit in minutes, as hours and minutes. */
export const formatMinutes = (minutes?: number | null): string | null => {
  if (minutes === null || minutes === undefined) return null;
  if (minutes < 60) return translate('{minutes} min', { minutes });
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest
    ? translate('{hours} h {minutes} min', { hours, minutes: rest })
    : translate('{hours} h', { hours });
};

/** The message the backend gave for a failed HPC request. */
export const getHpcErrorMessage = (error: unknown): string => {
  const body = getErrorBody(error);
  if (body) {
    if (typeof body.detail === 'string') return body.detail;
    if (Array.isArray(body.non_field_errors)) {
      return body.non_field_errors.join(' ');
    }
    // A list body (DRF's ValidationError raised with a list) arrives with its
    // items spread onto the error as keys "0", "1", ...: those are messages,
    // not field names, so they go without a label.
    const messages = Object.entries(body)
      .filter(([key]) => !['status', 'statusText'].includes(key))
      .flatMap(([key, value]) => {
        const label = isNaN(Number(key)) ? `${key}: ` : '';
        if (Array.isArray(value)) return [`${label}${value.join(' ')}`];
        if (typeof value === 'string') return [`${label}${value}`];
        return [];
      });
    if (messages.length) return messages.join(' ');
  }
  if (error instanceof Error && error.message) return error.message;
  return translate('The HPC service could not be reached.');
};

/** Lines a software selection contributes to the job's setup, without repeats. */
export const mergeSoftwareModules = (
  current: string[],
  software: Pick<HpcSoftware, 'setup' | 'load'>,
): string[] => {
  const result = [...current];
  for (const line of [...(software.setup || []), software.load]) {
    if (line && !result.includes(line)) {
      result.push(line);
    }
  }
  return result;
};

// The setup lines the API accepts ahead of the commands.
const SETUP_LINE = /^(module|spack|source)\s/;

/**
 * One job script as the user writes it: setup lines first ('module …',
 * 'spack …', 'source …'), then the commands. The API takes the two apart.
 */
export const splitJobScript = (
  script?: string,
): { modules: string[]; commands: string } => {
  const lines = (script || '').split('\n');
  const modules: string[] = [];
  let index = 0;
  for (; index < lines.length; index++) {
    const line = lines[index].trim();
    if (!line) continue;
    if (!SETUP_LINE.test(line)) break;
    modules.push(line);
  }
  return { modules, commands: lines.slice(index).join('\n').trim() };
};

/** The script with a software's setup lines added to its setup block. */
export const addSoftwareToScript = (
  script: string | undefined,
  software: Pick<HpcSoftware, 'setup' | 'load'>,
): string => {
  const { modules, commands } = splitJobScript(script);
  const setup = mergeSoftwareModules(modules, software).join('\n');
  return commands ? `${setup}\n\n${commands}` : `${setup}\n`;
};

/**
 * The lines Waldur writes ahead of the user's own: the shebang, the
 * #SBATCH options from the form and `module purge`, as the backend
 * rendered them for the values on screen.
 */
export const getGeneratedHeader = (script?: string): string[] => {
  const lines = (script || '').split('\n');
  const header: string[] = [];
  for (const line of lines) {
    if (line.startsWith('#') || line === 'module purge') header.push(line);
    else if (line.trim()) break;
  }
  return header;
};

export interface JobFormValues {
  name?: string;
  partition?: string;
  qos?: string;
  nodes?: number | string;
  ntasks_per_node?: number | string;
  cpus_per_task?: number | string;
  memory_mb?: number | string;
  time_limit_minutes?: number | string;
  gpus_per_node?: number | string;
  modules?: string;
  commands?: string;
  /** Setup lines and commands in one; wins over `modules` and `commands`. */
  script?: string;
  working_directory?: string;
}

const toNumber = (value: number | string | undefined | null) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const splitLines = (value?: string): string[] =>
  (value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

/** The job spec the API takes, from the submit form's values. */
export const buildJobSpec = (values: JobFormValues): HpcJobSpecRequest => {
  const body =
    values.script !== undefined
      ? splitJobScript(values.script)
      : {
          modules: splitLines(values.modules),
          commands: values.commands || '',
        };
  const spec: HpcJobSpecRequest = {
    name: (values.name || '').trim(),
    commands: body.commands,
  };
  if (values.partition) spec.partition = values.partition;
  if (values.qos) spec.qos = values.qos;
  const numbers = {
    nodes: toNumber(values.nodes),
    ntasks_per_node: toNumber(values.ntasks_per_node),
    cpus_per_task: toNumber(values.cpus_per_task),
    time_limit_minutes: toNumber(values.time_limit_minutes),
    gpus_per_node: toNumber(values.gpus_per_node),
  };
  Object.entries(numbers).forEach(([key, value]) => {
    if (value !== undefined) spec[key] = value;
  });
  const memory = toNumber(values.memory_mb);
  if (memory !== undefined) spec.memory_mb = memory;
  if (body.modules.length) spec.modules = body.modules;
  if (values.working_directory?.trim()) {
    spec.working_directory = values.working_directory.trim();
  }
  return spec;
};

export interface PathCrumb {
  label: string;
  path: string;
}

/** Breadcrumbs for an absolute path: the root, then each directory below it. */
export const getPathCrumbs = (path: string): PathCrumb[] => {
  const parts = path.split('/').filter(Boolean);
  return [
    { label: '/', path: '/' },
    ...parts.map((part, index) => ({
      label: part,
      path: '/' + parts.slice(0, index + 1).join('/'),
    })),
  ];
};

export const joinPath = (directory: string, name: string): string =>
  directory.endsWith('/') ? `${directory}${name}` : `${directory}/${name}`;

/** One page of rows an endpoint returned in full. */
/** The table's search: job ID, name, state, partition, user or nodes. */
export const matchesJobQuery = (
  job: Pick<
    HpcJob,
    'job_id' | 'name' | 'state' | 'partition' | 'user' | 'nodes'
  >,
  query?: string,
): boolean => {
  const needle = (query || '').trim().toLowerCase();
  if (!needle) return true;
  return [job.job_id, job.name, job.state, job.partition, job.user, job.nodes]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle));
};

export const getInMemoryPage = <T>(
  rows: T[],
  request: { currentPage: number; pageSize: number },
) => {
  const start = (request.currentPage - 1) * request.pageSize;
  return {
    rows: rows.slice(start, start + request.pageSize),
    resultCount: rows.length,
  };
};

/** Directories first, then everything else, each by name. */
export const sortDirectoryEntries = <T extends { name: string; type: string }>(
  entries: T[],
): T[] =>
  [...entries].sort((a, b) => {
    const aDir = a.type === 'd' ? 0 : 1;
    const bDir = b.type === 'd' ? 0 : 1;
    return aDir - bDir || a.name.localeCompare(b.name);
  });

/**
 * Output files the workspace can plot (see waldur_firecrest.outputs), by a
 * file name or a path.
 */
export const isPlottableFile = (path: string): boolean => {
  const name = path.slice(path.lastIndexOf('/') + 1);
  return (
    /\.(xvg|csv|tsv)$/i.test(name) || /^rsl\.(error|out)\.\d+$/i.test(name)
  );
};

/** Self-contained HTML reports (e.g. MultiQC) shown in a sandboxed frame. */
export const isHtmlReport = (name: string): boolean => /\.html?$/i.test(name);

/**
 * A waldur-ui Card as the app's bordered Metronic cards next to it (the
 * Partitions table, other resource tabs): no shadow, and in dark mode flush
 * with the page (as StatCard does) rather than on Card's lighter --card-bg.
 */
export const HPC_CARD_CLASS =
  'mb-6 shadow-none border-secondary dark:bg-[var(--page-bg)]';
