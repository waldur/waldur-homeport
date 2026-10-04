import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from '@uirouter/react';
import { Field, Form } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';

import { NavigationBlocker } from './NavigationBlocker';

const onBefore = () => vi.mocked(useRouter().transitionService.onBefore);

const renderForm = (props: { warnOnUnload?: boolean } = {}) => {
  const result = render(
    <Form
      onSubmit={() => undefined}
      initialValues={{ description: 'Saved' }}
      render={({ form }) => (
        <>
          <Field name="description" component="input" aria-label="Desc" />
          <Field name="users" component="input" aria-label="Users" />
          <button type="button" onClick={() => form.change('users', 'x')}>
            Mirror
          </button>
          <NavigationBlocker
            exiting="proposals.manage-proposal"
            isTracked={(field) => field !== 'users'}
            {...props}
          />
        </>
      )}
    />,
  );
  return result;
};

const unloadPrevented = () => {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
};

describe('NavigationBlocker', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stays out of the way while nothing is unsaved', () => {
    renderForm({ warnOnUnload: true });

    expect(onBefore()).not.toHaveBeenCalled();
    expect(unloadPrevented()).toBe(false);
  });

  it('ignores fields that are not tracked', async () => {
    renderForm({ warnOnUnload: true });

    await userEvent.click(screen.getByText('Mirror'));

    expect(onBefore()).not.toHaveBeenCalled();
    expect(unloadPrevented()).toBe(false);
  });

  it('asks before leaving the page once a tracked field changes', async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText('Desc'), ' edited');

    expect(onBefore()).toHaveBeenCalledWith(
      { exiting: 'proposals.manage-proposal' },
      expect.any(Function),
    );
    const guard = onBefore().mock.calls.at(-1)[1] as () => Promise<boolean>;

    vi.mocked(useModal().confirm).mockRejectedValueOnce(undefined);
    await expect(guard()).resolves.toBe(false);

    vi.mocked(useModal().confirm).mockResolvedValueOnce(undefined);
    await expect(guard()).resolves.toBe(true);
  });

  it('asks before a refresh only when warnOnUnload is set', async () => {
    const { unmount } = renderForm();
    await userEvent.type(screen.getByLabelText('Desc'), ' edited');
    expect(unloadPrevented()).toBe(false);
    unmount();

    renderForm({ warnOnUnload: true });
    await userEvent.type(screen.getByLabelText('Desc'), ' edited');
    expect(unloadPrevented()).toBe(true);
  });

  it('stops asking once the change is undone', async () => {
    renderForm({ warnOnUnload: true });
    const input = screen.getByLabelText('Desc');

    await userEvent.type(input, '!');
    expect(unloadPrevented()).toBe(true);

    await userEvent.type(input, '{backspace}');
    expect(unloadPrevented()).toBe(false);
  });
});
