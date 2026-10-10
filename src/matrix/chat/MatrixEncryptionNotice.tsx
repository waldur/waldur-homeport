import { FC, useCallback, useState } from 'react';

import { AlertItem, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { MatrixRecoveryKeyDialog } from './MatrixRecoveryKeyDialog';
import { useMatrixClient } from './useMatrixClient';

/**
 * Says when end-to-end encryption isn't usable in this session. An identity
 * Waldur can't unlock was usually set up or reset in another Matrix app, so
 * the user is offered to enter that app's recovery key first, and to reset
 * only if they have none. Nothing is shown while it works.
 */
export const MatrixEncryptionNotice: FC = () => {
  const { cryptoState, resetCryptoIdentity, importCryptoRecoveryKey } =
    useMatrixClient();
  const { confirm, openDialog } = useModal();
  const { showErrorResponse } = useNotify();
  const [resetting, setResetting] = useState(false);

  const reset = useCallback(async () => {
    try {
      await confirm(
        translate('Reset chat encryption?'),
        translate(
          'Your chat encryption keys can no longer be unlocked. Resetting creates new keys. Messages Waldur keeps a copy of become readable again; any others sent to you while encrypted are lost.',
        ),
        {
          positiveButton: translate('Reset encryption'),
          positiveButtonVariant: 'danger',
        },
      );
    } catch {
      return;
    }
    setResetting(true);
    try {
      await resetCryptoIdentity();
    } catch (e) {
      showErrorResponse(e, translate('Could not reset chat encryption.'));
    } finally {
      setResetting(false);
    }
  }, [confirm, resetCryptoIdentity, showErrorResponse]);

  const enterRecoveryKey = useCallback(
    () =>
      openDialog(MatrixRecoveryKeyDialog, {
        resolve: { importRecoveryKey: importCryptoRecoveryKey },
      }),
    [openDialog, importCryptoRecoveryKey],
  );

  if (cryptoState === 'locked' || cryptoState === 'resetting') {
    const busy = resetting || cryptoState === 'resetting';
    return (
      <AlertItem
        type="floating"
        variant="warning"
        className="m-3"
        title={translate('Encrypted messages cannot be read')}
        body={translate(
          'Your chat encryption keys could not be unlocked in this session. If you set up or reset encryption in another Matrix app, such as Element, enter the recovery key it gave you. Reset encryption only if you have no recovery key.',
        )}
        actions={
          <>
            <BaseButton
              label={translate('Enter recovery key')}
              onClick={enterRecoveryKey}
              disabled={busy}
              disabledReason={translate('Encryption is being reset.')}
              variant="primary"
            />
            <BaseButton
              label={translate('Reset encryption')}
              onClick={reset}
              pending={busy}
              variant="tertiary"
            />
          </>
        }
      />
    );
  }
  if (cryptoState === 'error') {
    return (
      <AlertItem
        type="floating"
        variant="error"
        className="m-3"
        title={translate('Encryption is unavailable in this browser')}
        body={translate(
          'Encrypted conversations cannot be read or written. Unencrypted ones still work.',
        )}
      />
    );
  }
  return null;
};
