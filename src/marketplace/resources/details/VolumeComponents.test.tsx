import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { VolumeComponents } from './VolumeComponents';

describe('VolumeComponents', () => {
  it('labels a volume without a type as plain storage', () => {
    // The API omits type_name entirely for a volume with no volume type.
    const { container } = render(
      <VolumeComponents resource={{ size: 20480 }} />,
    );
    expect(container.textContent).toContain('Storage');
    expect(container.textContent).not.toContain('undefined');
  });

  it('includes the volume type in the label when there is one', () => {
    const { container } = render(
      <VolumeComponents resource={{ size: 20480, type_name: 'ssd' }} />,
    );
    expect(container.textContent).toContain('ssd storage');
  });
});
