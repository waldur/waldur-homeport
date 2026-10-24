import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { ProjectAutocomplete } from './ProjectAutocomplete';

vi.mock('@/marketplace/common/autocompletes', () => ({
  projectAutocomplete: () => () =>
    Promise.resolve({
      options: [{ uuid: 'project-uuid', name: 'Climate modelling' }],
      hasMore: false,
    }),
}));

// jsdom can create a TouchEvent, so react-select takes it for a touch device
// and blurs the input on select, and a blurred select announces nothing.
const keepFocus = { blurInputOnSelect: false };

describe('ProjectAutocomplete', () => {
  it('announces the selected project by name', async () => {
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        {() => <ProjectAutocomplete reactSelectProps={keepFocus} />}
      </Form>,
    );

    await user.click(screen.getByRole('combobox', { name: 'Project' }));
    await user.click(await screen.findByText('Climate modelling'));

    expect(
      screen.getByText('option Climate modelling, selected.'),
    ).toBeInTheDocument();
  });
});
