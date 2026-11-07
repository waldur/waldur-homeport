import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { KeyValueTable } from './KeyValueTable';

describe('KeyValueTable', () => {
  it('renders empty message when items is undefined or empty', () => {
    const { rerender } = render(<KeyValueTable />);
    expect(screen.getByText('No attributes found.')).toBeInTheDocument();

    rerender(<KeyValueTable items={{}} />);
    expect(screen.getByText('No attributes found.')).toBeInTheDocument();
  });

  it('renders primitive string, number, and boolean values', () => {
    render(
      <KeyValueTable
        items={{
          host: 'node-01.internal',
          port: 8080,
          enabled: true,
          debug: false,
        }}
      />,
    );

    expect(screen.getByText('host')).toBeInTheDocument();
    expect(screen.getByText('node-01.internal')).toBeInTheDocument();

    expect(screen.getByText('port')).toBeInTheDocument();
    expect(screen.getByText('8080')).toBeInTheDocument();

    expect(screen.getByText('enabled')).toBeInTheDocument();
    expect(screen.getByText('True')).toBeInTheDocument();

    expect(screen.getByText('debug')).toBeInTheDocument();
    expect(screen.getByText('False')).toBeInTheDocument();
  });

  it('renders array values joined by commas', () => {
    render(
      <KeyValueTable
        items={{
          tags: ['compute', 'gpu', 'slurm'],
          emptyList: [],
        }}
      />,
    );

    expect(screen.getByText('tags')).toBeInTheDocument();
    expect(screen.getByText('compute, gpu, slurm')).toBeInTheDocument();

    expect(screen.getByText('emptyList')).toBeInTheDocument();
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('renders nested object as JSON pre block', () => {
    render(
      <KeyValueTable
        items={{
          config: { cpu: 8, memory: '32Gi' },
        }}
      />,
    );

    expect(screen.getByText('config')).toBeInTheDocument();
    const pre = screen.getByText((content) => content.includes('"cpu": 8'));
    expect(pre.tagName.toLowerCase()).toBe('pre');
  });
});
