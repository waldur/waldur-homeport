import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { StepFormPage } from './stepForm';
import {
  StepFormBackButton,
  StepFormNextButton,
  StepFormPageIndicator,
  useStepFormPage,
} from './StepFormWizard';

const PAGES: StepFormPage[] = ['basics', 'participants', 'timing'];

const Wizard = () => {
  const { page, setPage, isFirst, isLast, goBack, goNext } =
    useStepFormPage(PAGES);
  return (
    <Form
      onSubmit={() => undefined}
      render={() => (
        <div role="dialog" tabIndex={-1}>
          <StepFormPageIndicator pages={PAGES} page={page} onSelect={setPage} />
          <StepFormBackButton isFirst={isFirst} goBack={goBack} />
          <StepFormNextButton isLast={isLast} goNext={goNext} />
        </div>
      )}
    />
  );
};

describe('StepFormPageIndicator', () => {
  it('announces the page that Next and Back open', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Wizard />);
    const status = screen.getByRole('status');
    // Nothing is said about the page the dialog opens on.
    expect(status).toBeEmptyDOMElement();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(status).toHaveTextContent('Step 2 of 3: Participants');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(status).toHaveTextContent('Step 1 of 3: Basics');
  });

  it('puts focus on the open page when the pressed button goes away', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Wizard />);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    // Next is gone on the last page.
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(
      screen.queryByRole('button', { name: 'Next' }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Timing' })).toHaveFocus(),
    );
    // While Next stays, it keeps the focus.
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'Step 2 of 3: Participants',
      ),
    );
    expect(screen.getByRole('button', { name: 'Back' })).toHaveFocus();
  });
});
