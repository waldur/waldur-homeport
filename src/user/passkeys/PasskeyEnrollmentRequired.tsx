import { FingerprintIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';

import { lazyComponent } from '@/core/lazyComponent';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

const PasskeyRegisterDialog = lazyComponent(() =>
  import('./PasskeyRegisterDialog').then((module) => ({
    default: module.PasskeyRegisterDialog,
  })),
);

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

  const enrol = useCallback(
    () =>
      openDialog(PasskeyRegisterDialog, {
        resolve: {
          // A successful enrolment changes has_passkey, so the simplest
          // correct thing is a full reload: it refetches the user and the
          // transition hook then lets them through to where they were going.
          refetch: () => window.location.reload(),
        },
      }),
    [openDialog],
  );

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
                submitting={false}
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
