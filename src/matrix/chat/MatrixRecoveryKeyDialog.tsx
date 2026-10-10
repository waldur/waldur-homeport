import { EyeIcon, EyeSlashIcon, KeyIcon } from '@phosphor-icons/react';
import { FC, FormEvent, useState } from 'react';
import { Form, Stack } from 'react-bootstrap';

import { BaseButton } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { CryptoConflict, CryptoSessionEnded, WrongRecoveryKey } from './crypto';
import { MaskedKeyInput } from './MaskedKeyInput';

interface MatrixRecoveryKeyDialogProps {
  resolve: {
    importRecoveryKey: (recoveryKey: string) => Promise<void>;
  };
}

const FORM_ID = 'matrix-recovery-key-form';

const describeFailure = (error: unknown) => {
  if (
    error instanceof WrongRecoveryKey ||
    (error instanceof CryptoConflict && error.state === 'wrong_key')
  ) {
    return translate(
      'This recovery key does not unlock your chat encryption. Check that it is the latest one your Matrix app showed you.',
    );
  }
  if (error instanceof CryptoConflict && error.state === 'in_progress') {
    return translate(
      'Encryption is being set up in another window. Try again in a moment.',
    );
  }
  if (error instanceof CryptoConflict && error.state === 'not_locked') {
    return translate(
      'Your chat encryption changed in the meantime. Reload the chat.',
    );
  }
  if (error instanceof CryptoSessionEnded) {
    return translate(
      'Your chat session has ended. Close this dialog and open the chat again.',
    );
  }
  return translate('Could not unlock chat encryption. Please try again.');
};

/**
 * Asks once for the recovery key of an identity set up or reset in another
 * Matrix app. The key stays in this dialog's state only, and goes nowhere but
 * the check against secret storage and Waldur's escrow.
 */
export const MatrixRecoveryKeyDialog: FC<MatrixRecoveryKeyDialogProps> = ({
  resolve,
}) => {
  const { closeDialog } = useModal();
  const [recoveryKey, setRecoveryKey] = useState('');
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!recoveryKey.trim() || pending) return;
    setPending(true);
    setFailure(null);
    try {
      await resolve.importRecoveryKey(recoveryKey);
      setRecoveryKey('');
      closeDialog();
    } catch (error) {
      setFailure(describeFailure(error));
      setPending(false);
    }
  };

  return (
    <ModalDialog
      title={translate('Unlock chat encryption')}
      subtitle={translate(
        'Your chat encryption was set up or changed in another Matrix app, such as Element. Enter the recovery key that app gave you to read your encrypted messages here.',
      )}
      iconNode={<KeyIcon weight="bold" />}
      footer={
        <>
          <CloseDialogButton label={translate('Cancel')} />
          <BaseButton
            type="submit"
            form={FORM_ID}
            label={translate('Unlock')}
            pending={pending}
            disabled={!recoveryKey.trim()}
            disabledReason={
              recoveryKey.trim()
                ? undefined
                : translate('Enter your recovery key first.')
            }
            variant="primary"
            size="lg"
          />
        </>
      }
    >
      <Form id={FORM_ID} onSubmit={submit} noValidate>
        <Form.Group controlId="matrix-recovery-key">
          <Form.Label>{translate('Recovery key')}</Form.Label>
          <Stack gap={2} direction="horizontal">
            <MaskedKeyInput
              value={recoveryKey}
              onChange={setRecoveryKey}
              revealed={revealed}
              isInvalid={Boolean(failure)}
              aria-describedby="matrix-recovery-key-help"
              disabled={pending}
              className="flex-grow-1"
              autoFocus
            />
            <BaseButton
              iconNode={
                revealed ? (
                  <EyeSlashIcon weight="bold" />
                ) : (
                  <EyeIcon weight="bold" />
                )
              }
              tooltip={revealed ? translate('Hide') : translate('Show')}
              aria-label={revealed ? translate('Hide') : translate('Show')}
              aria-pressed={revealed}
              onClick={() => setRevealed(!revealed)}
              variant="text-secondary"
              size="sm"
            />
            <CopyToClipboardButton
              value={recoveryKey}
              size={20}
              buttonVariant="text-secondary"
              onlyButton
            />
          </Stack>
          {failure && (
            <Form.Text className="text-danger d-block" role="alert">
              {failure}
            </Form.Text>
          )}
          <Form.Text id="matrix-recovery-key-help" className="text-muted">
            {translate(
              'Waldur keeps it for you, so you are asked for it only once.',
            )}
          </Form.Text>
        </Form.Group>
      </Form>
    </ModalDialog>
  );
};
