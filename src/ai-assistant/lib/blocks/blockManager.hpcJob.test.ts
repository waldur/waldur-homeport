import { describe, expect, it } from 'vitest';

import { extractTextFromBlocks } from '@/ai-assistant/lib/messages/messageUtils';
import { UIBlock } from '@/ai-assistant/lib/types';

import { updateBlocks } from './blockManager';

const previewPart = {
  k: 'hpc_job',
  status: 'preview',
  name: 'gromacs-run',
  allocation: 'Molecular dynamics',
  allocation_uuid: 'abc123',
  account: 'project_465',
  cluster: 'lumi',
  partition: 'standard',
  script: '#!/bin/bash\n#SBATCH --account=project_465\nsrun gmx mdrun',
  errors: [],
  warnings: ['No memory requested; the partition default applies.'],
};

describe('updateBlocks for hpc_job', () => {
  it('keeps the card state as job_status, not the block lifecycle', () => {
    const [block] = updateBlocks([], previewPart as any);
    expect(block.key).toBe('hpc_job');
    expect(block.job_status).toBe('preview');
    expect(block.status).toBe('streaming');
    expect(block.name).toBe('gromacs-run');
    expect(block.allocation_uuid).toBe('abc123');
    expect(block.script).toContain('srun gmx mdrun');
    expect(block.warnings).toHaveLength(1);
  });

  it('replaces the tool loading block with the card', () => {
    const loading: UIBlock = {
      id: 't',
      key: 'tool',
      content: '',
      status: 'loading',
    };
    const blocks = updateBlocks([loading], previewPart as any);
    expect(blocks.map((block) => block.key)).toEqual(['hpc_job']);
  });

  it('merges a later part into the same card', () => {
    const first = updateBlocks([], previewPart as any);
    const blocks = updateBlocks(first, {
      k: 'hpc_job',
      status: 'submitted',
      job_id: '4242',
    } as any);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].id).toBe(first[0].id);
    expect(blocks[0].job_status).toBe('submitted');
    expect(blocks[0].job_id).toBe('4242');
    expect(blocks[0].name).toBe('gromacs-run');
  });

  it('starts a new card after another kind of block', () => {
    const markdown: UIBlock = {
      id: 'm',
      key: 'markdown',
      content: 'Here is the plan',
      status: 'streaming',
    };
    const blocks = updateBlocks([markdown], previewPart as any);
    expect(blocks.map((block) => block.key)).toEqual(['markdown', 'hpc_job']);
  });
});

describe('extractTextFromBlocks for hpc_job', () => {
  it('describes a preview with its script and warnings', () => {
    const blocks = updateBlocks([], previewPart as any);
    const text = extractTextFromBlocks(blocks);
    expect(text).toContain('HPC Job Preview');
    expect(text).toContain('Job Name: gromacs-run');
    expect(text).toContain('Account: project_465');
    expect(text).toContain('Partition: standard');
    expect(text).toContain('- No memory requested');
    expect(text).toContain('srun gmx mdrun');
  });

  it('lists the errors of a job that does not fit', () => {
    const block: UIBlock = {
      id: 'h',
      key: 'hpc_job',
      content: '',
      status: 'complete',
      job_status: 'error',
      name: 'too-big',
      errors: ['Time limit 3000 min exceeds the partition maximum 2880.'],
    };
    const text = extractTextFromBlocks([block]);
    expect(text).toContain('HPC Job Does Not Fit The Cluster Limits');
    expect(text).toContain('- Time limit 3000 min exceeds');
  });

  it('names the job ID once submitted', () => {
    const block: UIBlock = {
      id: 'h',
      key: 'hpc_job',
      content: '',
      status: 'complete',
      job_status: 'submitted',
      name: 'gromacs-run',
      job_id: '4242',
    };
    expect(extractTextFromBlocks([block])).toContain('Job ID: 4242');
  });
});
