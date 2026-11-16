import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WizardStepProps } from './types';
import { WizardFormContainer } from './WizardFormContainer';

const NameStep: FC<WizardStepProps> = ({ form }) => (
  <input
    aria-label="Name"
    defaultValue=""
    onChange={(event) => form.change('name', event.target.value)}
  />
);

const steps = [{ key: 'name', label: 'Name', completed: false }];

// A caller keeping the form's values in its own state, as the dialogs that
// add a step once an offering is chosen do.
const Caller = () => {
  const [name, setName] = useState<string>(null);
  return (
    <>
      <span data-testid="seen">{name ?? 'nothing'}</span>
      <WizardFormContainer
        title="Wizard"
        steps={steps}
        wizardForms={[NameStep]}
        initialValues={{ name: 'initial' }}
        onSubmit={vi.fn()}
        onChange={(values) => setName(values.name)}
      />
    </>
  );
};

describe('WizardFormContainer onChange', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports the values without updating the caller while rendering', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(<Caller />);

    await waitFor(() =>
      expect(screen.getByTestId('seen')).toHaveTextContent('initial'),
    );
    await user.type(screen.getByLabelText('Name'), 'x');
    await waitFor(() =>
      expect(screen.getByTestId('seen')).toHaveTextContent('x'),
    );
    expect(
      consoleError.mock.calls.filter((args) =>
        String(args[0]).includes('Cannot update a component'),
      ),
    ).toEqual([]);
  });
});
