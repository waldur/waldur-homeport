import { describe, expect, it } from 'vitest';

import {
  addSoftwareToScript,
  getGeneratedHeader,
  splitJobScript,
  buildJobSpec,
  formatElapsed,
  getHpcErrorMessage,
  getInMemoryPage,
  matchesJobQuery,
  getJobStateVariant,
  getPathCrumbs,
  hasActiveJobs,
  isActiveJobState,
  isCancellableJobState,
  isHtmlReport,
  isPlottableFile,
  joinPath,
  mergeSoftwareModules,
  normalizeJobState,
  sortDirectoryEntries,
} from './utils';

describe('job states', () => {
  it('reads the leading word of a Slurm state', () => {
    expect(normalizeJobState('CANCELLED by 1234')).toBe('CANCELLED');
    expect(normalizeJobState('running')).toBe('RUNNING');
    expect(normalizeJobState(null)).toBe('');
  });

  it('treats pending and running jobs as active', () => {
    expect(isActiveJobState('PENDING')).toBe(true);
    expect(isActiveJobState('RUNNING')).toBe(true);
    expect(isActiveJobState('COMPLETING')).toBe(true);
    expect(isActiveJobState('COMPLETED')).toBe(false);
    expect(isActiveJobState('CANCELLED by 1')).toBe(false);
  });

  it('cancels only pending and running jobs', () => {
    expect(isCancellableJobState('PENDING')).toBe(true);
    expect(isCancellableJobState('RUNNING')).toBe(true);
    expect(isCancellableJobState('COMPLETING')).toBe(false);
    expect(isCancellableJobState('FAILED')).toBe(false);
  });

  it('polls while any job is active', () => {
    expect(hasActiveJobs([{ state: 'COMPLETED' }, { state: 'PENDING' }])).toBe(
      true,
    );
    expect(hasActiveJobs([{ state: 'COMPLETED' }])).toBe(false);
    expect(hasActiveJobs(undefined)).toBe(false);
  });

  it('colours states by outcome', () => {
    expect(getJobStateVariant('COMPLETED')).toBe('success');
    expect(getJobStateVariant('FAILED')).toBe('danger');
    expect(getJobStateVariant('TIMEOUT')).toBe('danger');
    expect(getJobStateVariant('RUNNING')).toBe('primary');
    expect(getJobStateVariant('PENDING')).toBe('warning');
    expect(getJobStateVariant('CANCELLED by 1')).toBe('neutral');
  });
});

describe('formatElapsed', () => {
  it('prints Slurm-style durations', () => {
    expect(formatElapsed(0)).toBe('00:00:00');
    expect(formatElapsed(3725)).toBe('01:02:05');
    expect(formatElapsed(90061)).toBe('1-01:01:01');
    expect(formatElapsed(null)).toBeNull();
  });
});

describe('getHpcErrorMessage', () => {
  it('surfaces the backend detail', () => {
    expect(
      getHpcErrorMessage({
        detail: 'HPC services need a sign-in through your identity provider.',
        status: 400,
        response: {},
      }),
    ).toBe('HPC services need a sign-in through your identity provider.');
  });

  it('joins field errors', () => {
    expect(
      getHpcErrorMessage({ status: 400, modules: ['Setup lines must be …'] }),
    ).toBe('modules: Setup lines must be …');
  });

  it('shows a list body without its indexes', () => {
    expect(
      getHpcErrorMessage({
        0: 'Your identity provider session has expired.',
        1: 'Sign in again.',
        status: 400,
        response: {},
      }),
    ).toBe('Your identity provider session has expired. Sign in again.');
  });

  it('falls back to a generic message', () => {
    expect(getHpcErrorMessage(undefined)).toBeTruthy();
  });
});

describe('mergeSoftwareModules', () => {
  it('adds setup and load lines once', () => {
    const software = {
      setup: ['source /cvmfs/eessi/init/bash'],
      load: 'module load GROMACS/2024.1-foss-2023b',
    };
    const once = mergeSoftwareModules([], software);
    expect(once).toEqual([
      'source /cvmfs/eessi/init/bash',
      'module load GROMACS/2024.1-foss-2023b',
    ]);
    expect(mergeSoftwareModules(once, software)).toEqual(once);
  });
});

describe('buildJobSpec', () => {
  it('converts form values to the API spec', () => {
    expect(
      buildJobSpec({
        name: ' run-1 ',
        commands: 'srun hostname',
        partition: 'standard',
        qos: '',
        nodes: '2',
        ntasks_per_node: 4,
        cpus_per_task: '',
        memory_mb: '',
        time_limit_minutes: '30',
        gpus_per_node: 0,
        modules: 'module load foo\n\n  module load bar  ',
        working_directory: '  ',
      }),
    ).toEqual({
      name: 'run-1',
      commands: 'srun hostname',
      partition: 'standard',
      nodes: 2,
      ntasks_per_node: 4,
      time_limit_minutes: 30,
      gpus_per_node: 0,
      modules: ['module load foo', 'module load bar'],
    });
  });
});

describe('job script', () => {
  it('takes the leading setup lines apart from the commands', () => {
    expect(
      splitJobScript(
        '\nmodule load GROMACS/2024\nspack load fftw\n\nsrun gmx mdrun\nmodule list\n',
      ),
    ).toEqual({
      modules: ['module load GROMACS/2024', 'spack load fftw'],
      commands: 'srun gmx mdrun\nmodule list',
    });
  });

  it('adds software to the setup block once', () => {
    const software = {
      setup: ['source /opt/env.sh'],
      load: 'module load WRF/4.5',
    };
    const script = addSoftwareToScript(
      'module load foss\n\n./wrf.exe',
      software,
    );
    expect(script).toBe(
      'module load foss\nsource /opt/env.sh\nmodule load WRF/4.5\n\n./wrf.exe',
    );
    expect(addSoftwareToScript(script, software)).toBe(script);
  });

  it('picks the generated lines off a rendered script', () => {
    expect(
      getGeneratedHeader(
        '#!/bin/bash\n#SBATCH --nodes=1\n\nmodule purge\nmodule load X\n\nsrun x',
      ),
    ).toEqual(['#!/bin/bash', '#SBATCH --nodes=1', 'module purge']);
  });

  it('builds the spec from the script', () => {
    const spec = buildJobSpec({ name: 'md', script: 'module load X\nsrun x' });
    expect(spec.modules).toEqual(['module load X']);
    expect(spec.commands).toBe('srun x');
  });
});

describe('paths', () => {
  it('builds breadcrumbs from the root', () => {
    expect(getPathCrumbs('/users/alice/runs')).toEqual([
      { label: '/', path: '/' },
      { label: 'users', path: '/users' },
      { label: 'alice', path: '/users/alice' },
      { label: 'runs', path: '/users/alice/runs' },
    ]);
  });

  it('joins a directory and a name', () => {
    expect(joinPath('/users/alice', 'runs')).toBe('/users/alice/runs');
    expect(joinPath('/', 'scratch')).toBe('/scratch');
  });

  it('lists directories first', () => {
    expect(
      sortDirectoryEntries([
        { name: 'b.txt', type: '-' },
        { name: 'z', type: 'd' },
        { name: 'a.txt', type: '-' },
        { name: 'm', type: 'd' },
      ]).map((entry) => entry.name),
    ).toEqual(['m', 'z', 'a.txt', 'b.txt']);
  });
});

describe('matchesJobQuery', () => {
  const job = {
    job_id: '107',
    name: 'gromacs-md',
    state: 'COMPLETED',
    partition: 'gpu',
    user: 'alice',
    nodes: 'node[037-038]',
  };
  it('matches the id, name and other columns, ignoring case', () => {
    expect(matchesJobQuery(job, '107')).toBe(true);
    expect(matchesJobQuery(job, 'GROMACS')).toBe(true);
    expect(matchesJobQuery(job, 'node037')).toBe(false);
    expect(matchesJobQuery(job, 'node[037')).toBe(true);
    expect(matchesJobQuery(job, '  ')).toBe(true);
    expect(matchesJobQuery(job, 'wrf')).toBe(false);
  });
});

describe('getInMemoryPage', () => {
  it('slices the requested page', () => {
    const rows = [1, 2, 3, 4, 5];
    expect(getInMemoryPage(rows, { currentPage: 2, pageSize: 2 })).toEqual({
      rows: [3, 4],
      resultCount: 5,
    });
  });
});

describe('output file types', () => {
  it('recognises plottable outputs', () => {
    expect(isPlottableFile('energy.xvg')).toBe(true);
    expect(isPlottableFile('loss.CSV')).toBe(true);
    expect(isPlottableFile('rsl.error.0000')).toBe(true);
    expect(isPlottableFile('/scratch/alice/run/rsl.out.0000')).toBe(true);
    expect(isPlottableFile('/scratch/alice/rsl.out.0000/notes.txt')).toBe(
      false,
    );
    expect(isPlottableFile('wrfout_d01')).toBe(false);
  });

  it('recognises HTML reports', () => {
    expect(isHtmlReport('multiqc_report.html')).toBe(true);
    expect(isHtmlReport('report.pdf')).toBe(false);
  });
});
