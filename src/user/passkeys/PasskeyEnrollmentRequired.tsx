import { FingerprintIcon } from '@phosphor-icons/react';
import { FunctionComponent, useState } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';

import { lazyComponent } from '@/core/lazyComponent';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { router } from '@/router';
import { useNotify } from '@/store/notify';
import { getBlockedNavigation } from '@/user/blockedNavigation';
import { needsPasskeyEnrollment } from '@/user/passkeys/enforcement';
import { UsersService } from '@/user/UsersService';
import { useUser } from '@/workspace/hooks';

const DEFAULT_STATE = 'profile.details';

const PasskeyRegisterDialog = lazyComponent(() =>
  import('./PasskeyRegisterDialog').then((module) => ({
    default: module.PasskeyRegisterDialog,
  })),
);

type Notify = Pick<
  ReturnType<typeof useNotify>,
  'showError' | 'showErrorResponse'
>;

/**
 * Runs after a successful enrolment. Refreshes the signed-in user so the
 * transition guard sees has_passkey, then resumes the page the guard
 * remembered when it sent the user here — the same handoff the
 * profile-manage gate does once the terms are accepted.
 *
 * Exported for tests; the dialog calls it fire-and-forget, so it must never
 * reject.
 */
export const resumeAfterEnrolment = async ({
  showError,
  showErrorResponse,
}: Notify): Promise<void> => {
  let user;
  try {
    user = await UsersService.refreshCurrentUser();
  } catch (e) {
    showErrorResponse(
      e,
      translate(
        'The passkey was registered, but your account could not be refreshed. Reload the page to continue.',
      ),
    );
    return;
  }
  // Navigating now would only bounce straight back here with a success
  // toast and no explanation, and a second click would enrol another key.
  if (needsPasskeyEnrollment(user)) {
    showError(
      translate(
        'The passkey was registered, but your account still reports none. Reload the page to continue.',
      ),
    );
    return;
  }
  const blocked = getBlockedNavigation();
  const target =
    blocked && router.stateRegistry.get(blocked.toState)
      ? blocked
      : { toState: DEFAULT_STATE, toParams: {} };
  // The remembered page is left in storage: the onSuccess hook in
  // transitions.ts clears it on arrival, so a superseded or aborted attempt
  // keeps the intent for the next gate. A rejected go() means another
  // transition (the user's own click, or a guard redirect) already took
  // over — there is nothing further to do or report.
  await router.stateService
    .go(target.toState, target.toParams)
    .catch(() => undefined);
};

/**
 * Shown instead of the requested page when a privileged account has not yet
 * enrolled a passkey.
 *
 * The page offers exactly one action. Anything else here would be a way
 * around the requirement, and the transition hook sends the user straight
 * back anyway.
 */
export const PasskeyEnrollmentRequired: FunctionComponent = () => {
  const user = useUser();
  const { openDialog } = useModal();
  const notify = useNotify();
  // The dialog closes before the resume finishes; keep the button busy until
  // then so a slow refresh can't be answered with a second enrolment.
  const [resuming, setResuming] = useState(false);

  const enrol = () =>
    openDialog(PasskeyRegisterDialog, {
      resolve: {
        refetch: async () => {
          setResuming(true);
          try {
            await resumeAfterEnrolment(notify);
          } finally {
            setResuming(false);
          }
        },
      },
    });

  return (
    <Container className="py-10">
      <Row className="justify-content-center">
        <Col md={7} lg={6}>
          <Card>
            <Card.Body className="text-center p-10">
              <div className="mb-5">
                <span className="svg-icon svg-icon-3x text-primary">
                  <FingerprintIcon weight="bold" />
                </span>
              </div>
              <h2 className="mb-4">{translate('Add a passkey to continue')}</h2>
              <p className="text-muted mb-8">
                {translate(
                  'This deployment requires a passkey for administrator accounts. Add one now to carry on — it takes a moment, and you can use your device screen lock or a security key.',
                )}
              </p>
              <SubmitButton
                submitting={resuming}
                onClick={enrol}
                type="button"
                label={translate('Add passkey')}
                className="w-100"
                data-testid="passkey-enrollment-required-add"
              />
              {user?.username && (
                <p className="text-muted mt-6 mb-0">
                  {translate('Signed in as {username}', {
                    username: user.username,
                  })}
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
