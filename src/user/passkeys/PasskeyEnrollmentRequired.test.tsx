import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { router } from '@/router';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

const {
  refreshCurrentUserMock,
  getBlockedNavigationMock,
  clearBlockedNavigationMock,
  needsPasskeyEnrollmentMock,
} = vi.hoisted(() => ({
  refreshCurrentUserMock: vi.fn(),
  getBlockedNavigationMock: vi.fn(),
  clearBlockedNavigationMock: vi.fn(),
  needsPasskeyEnrollmentMock: vi.fn(),
}));

// `@/modal/actions`, `@/store/notify`, `@/router` / `@uirouter/react` and
// `@/workspace/hooks` are mocked globally (test/mocks).
vi.mock('@/user/UsersService', () => ({
  UsersService: { refreshCurrentUser: refreshCurrentUserMock },
}));

vi.mock('@/user/blockedNavigation', () => ({
  getBlockedNavigation: getBlockedNavigationMock,
  clearBlockedNavigation: clearBlockedNavigationMock,
}));

vi.mock('@/user/passkeys/enforcement', () => ({
  needsPasskeyEnrollment: needsPasskeyEnrollmentMock,
}));

vi.mock('@/core/lazyComponent', () => ({
  lazyComponent: () => () => null,
}));

import {
  PasskeyEnrollmentRequired,
  resumeAfterEnrolment,
} from './PasskeyEnrollmentRequired';

const enrolled = { username: 'alice', has_passkey: true };
const notify = () => useNotify();

/** A promise the test resolves by hand, to hold a request "in flight". */
const deferred = <T,>() => {
  let resolve: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve: resolve! };
};

describe('PasskeyEnrollmentRequired', () => {
  const goMock = vi.mocked(router.stateService.go);
  const getStateMock = vi.mocked(router.stateRegistry.get);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue(enrolled as any);
    refreshCurrentUserMock.mockResolvedValue(enrolled);
    needsPasskeyEnrollmentMock.mockReturnValue(false);
    getBlockedNavigationMock.mockReturnValue(null);
    goMock.mockResolvedValue(undefined);
    getStateMock.mockImplementation((name: string) => ({ name }) as any);
  });

  it('keeps the button busy while the resume is in flight', async () => {
    const refresh = deferred<typeof enrolled>();
    refreshCurrentUserMock.mockReturnValue(refresh.promise);
    render(<PasskeyEnrollmentRequired />);
    const button = screen.getByTestId('passkey-enrollment-required-add');
    await userEvent.click(button);

    const { openDialog } = useModal();
    expect(openDialog).toHaveBeenCalledTimes(1);
    const resume = vi.mocked(openDialog).mock.calls[0][1].resolve.refetch();

    await waitFor(() => expect(button).toBeDisabled());
    refresh.resolve(enrolled);
    await resume;

    expect(goMock).toHaveBeenCalledWith('profile.details', {});
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('refreshes the user and resumes the remembered page', async () => {
    getBlockedNavigationMock.mockReturnValue({
      toState: 'project.details',
      toParams: { uuid: '1' },
    });

    await resumeAfterEnrolment(notify());

    expect(refreshCurrentUserMock).toHaveBeenCalledTimes(1);
    expect(goMock).toHaveBeenCalledWith('project.details', { uuid: '1' });
    // Arrival clears the intent (transitions.ts onSuccess), not this page.
    expect(clearBlockedNavigationMock).not.toHaveBeenCalled();
  });

  it('falls back to the default page when the remembered state no longer exists', async () => {
    getBlockedNavigationMock.mockReturnValue({
      toState: 'gone.state',
      toParams: {},
    });
    getStateMock.mockReturnValue(null);

    await resumeAfterEnrolment(notify());

    expect(goMock).toHaveBeenCalledTimes(1);
    expect(goMock).toHaveBeenCalledWith('profile.details', {});
  });

  it('leaves a competing transition alone when navigation is rejected', async () => {
    getBlockedNavigationMock.mockReturnValue({
      toState: 'project.details',
      toParams: {},
    });
    goMock.mockRejectedValue(new Error('superseded'));

    await expect(resumeAfterEnrolment(notify())).resolves.toBeUndefined();

    expect(goMock).toHaveBeenCalledTimes(1);
    expect(notify().showError).not.toHaveBeenCalled();
  });

  it('stays put and explains when the refreshed user still owes a passkey', async () => {
    needsPasskeyEnrollmentMock.mockReturnValue(true);

    await resumeAfterEnrolment(notify());

    expect(needsPasskeyEnrollmentMock).toHaveBeenCalledWith(enrolled);
    expect(notify().showError).toHaveBeenCalledTimes(1);
    expect(goMock).not.toHaveBeenCalled();
  });

  it('stays put and reports when the user cannot be refreshed', async () => {
    refreshCurrentUserMock.mockRejectedValue(new Error('offline'));

    await expect(resumeAfterEnrolment(notify())).resolves.toBeUndefined();

    expect(notify().showErrorResponse).toHaveBeenCalledTimes(1);
    expect(goMock).not.toHaveBeenCalled();
  });
});
