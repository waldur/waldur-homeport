import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OptionsUpdate } from './OptionsUpdate';

vi.mock('./OrderCommonFields', async () => {
  const actual = await vi.importActual<any>('./OrderCommonFields');
  return {
    ...actual,
    RequestedByField: () => null,
    RequestCommentField: () => null,
    DescriptionField: () => null,
    StartDateField: () => null,
  };
});

describe('OptionsUpdate', () => {
  it('lists only the options the order changes, by label', () => {
    render(
      <OptionsUpdate
        order={
          {
            attributes: {
              old_options: { note: 'x', storage: 200 },
              // The server stores the whole option set.
              new_options: { note: 'x', storage: 300 },
            },
          } as any
        }
        offering={
          {
            resource_options: {
              options: {
                note: { label: 'Note' },
                storage: { label: 'Database storage (GB)' },
              },
            },
          } as any
        }
        tableOnly
      />,
    );
    expect(screen.getByText('Database storage (GB)')).toBeInTheDocument();
    expect(screen.queryByText('Note')).not.toBeInTheDocument();
  });
});
