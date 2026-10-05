import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InstanceComponents } from './InstanceComponents';

const buildInstance = (volumes) => ({ cores: 2, ram: 4096, volumes }) as any;

// Each quota cell renders its title and its value as adjacent spans.
const getStorageRows = () =>
  screen
    .getAllByText(/storage$/i)
    .map((node) => [node.textContent, node.nextSibling?.textContent]);

describe('InstanceComponents', () => {
  it('labels volumes without a type as plain storage', () => {
    // The API omits type_name entirely for a volume with no volume type.
    const { container } = render(
      <InstanceComponents
        resource={buildInstance([{ size: 20480 }, { size: 20480 }])}
      />,
    );
    expect(getStorageRows()).toEqual([['Storage', '40 GB']]);
    expect(container.textContent).not.toContain('undefined');
  });

  it('keeps one row per volume type next to the untyped one', () => {
    render(
      <InstanceComponents
        resource={buildInstance([
          { size: 10240, type_name: 'ssd' },
          { size: 10240, type_name: null },
          { size: 20480, type_name: 'ssd' },
          { size: 51200, type_name: 'hdd' },
        ])}
      />,
    );
    expect(getStorageRows()).toEqual([
      ['Storage', '10 GB'],
      ['hdd storage', '50 GB'],
      ['ssd storage', '30 GB'],
    ]);
  });

  it('shows no plain storage row when every volume has a type', () => {
    render(
      <InstanceComponents
        resource={buildInstance([
          { size: 10240, type_name: 'ssd' },
          { size: 20480, type_name: 'ssd' },
        ])}
      />,
    );
    expect(getStorageRows()).toEqual([['ssd storage', '30 GB']]);
  });
});
