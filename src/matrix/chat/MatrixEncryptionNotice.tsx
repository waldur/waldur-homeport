import { FC, useCallback, useState } from 'react';

import { AlertItem, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { useMatrixClient } from './useMatrixClient';

/**
 * Says when end-to-end encryption isn't usable in this session, and offers to
 * reset an identity Waldur can't unlock. Nothing is shown while it works.
 */
export const MatrixEncryptionNotice: FC = () => {
  const { cryptoState, resetCryptoIdentity } = useMatrixClient();
  const { confirm } = useModal();
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

  if (cryptoState === 'locked' || cryptoState === 'resetting') {
    return (
      <AlertItem
        type="floating"
        variant="warning"
        className="m-3"
        title={translate('Encrypted messages cannot be read')}
        body={translate(
          'Your chat encryption keys could not be unlocked in this session.',
        )}
        actions={
          <BaseButton
            label={translate('Reset encryption')}
            onClick={reset}
            pending={resetting || cryptoState === 'resetting'}
            variant="tertiary"
          />
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
