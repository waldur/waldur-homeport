import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AttributeSection } from './AttributeSection';

const section: any = {
  title: 'Hardware',
  attributes: [
    { key: 'cpu', title: 'CPU model', type: 'string' },
    { key: 'gpu', title: 'GPU', type: 'string' },
  ],
};

describe('AttributeSection', () => {
  it('renders the section as a titled list of attributes', () => {
    const { container } = render(
      <AttributeSection
        section={section}
        attributes={{ cpu: 'EPYC 7763' }}
        hideHeader={false}
      />,
    );

    expect(screen.getByText('Hardware')).toBeInTheDocument();
    // The title is a heading beside the list, not a row inside the `<dl>`.
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('dl')).toHaveLength(1);
    expect(
      screen.getByRole('definition', { name: 'CPU model' }),
    ).toHaveTextContent('EPYC 7763');
    expect(screen.getByRole('definition', { name: 'GPU' })).toHaveTextContent(
      '—',
    );
  });

  it('leaves the title out when the panel has one section', () => {
    render(
      <AttributeSection section={section} attributes={{}} hideHeader={true} />,
    );

    expect(screen.queryByText('Hardware')).not.toBeInTheDocument();
    expect(screen.getAllByRole('term')).toHaveLength(2);
  });
});
