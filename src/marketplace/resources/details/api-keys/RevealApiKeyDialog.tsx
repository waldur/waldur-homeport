import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { Form, Stack } from 'react-bootstrap';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { BaseSecretField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';

import { useRevealedApiKey } from './useResourceApiKeys';

interface OwnProps {
  resolve: { uuid: string; canManage: boolean; onRotate: () => void };
}

// Reveal follows the service-account model (ServiceAccountShowInfoDialog): the
// secret is shown in a masked BaseSecretField (built-in show/hide) with a copy
// button. The dialog opens immediately and stays in a loading/disabled state
// until the (audit-logged) reveal request returns the actual key.
export const RevealApiKeyDialog = ({ resolve }: OwnProps) => {
  const { closeDialog } = useModal();
  const { value, reveal } = useRevealedApiKey(resolve.uuid);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );

  useEffect(() => {
    let active = true;
    reveal()
      .then((key) => active && setStatus(key ? 'ready' : 'error'))
      .catch(() => active && setStatus('error'));
    return () => {
      active = false;
    };
  }, [reveal]);

  const ready = status === 'ready' && Boolean(value);

  const rotate = () => {
    // Close first so the rotate confirmation isn't stacked on this dialog; the
    // key list then shows the row spinning Updating → OK on its own.
    closeDialog();
    resolve.onRotate();
  };

  return (
    <ModalDialog
      title={translate('API key')}
      footer={
        resolve.canManage ? (
          <SubmitButton
            submitting={false}
            onClick={rotate}
            disabled={!ready}
            label={translate('Rotate')}
            iconNode={<ArrowsClockwiseIcon weight="bold" />}
            iconOnLeft
          />
        ) : undefined
      }
    >
      <Form.Group className="mb-2">
        <Form.Label>{translate('Key')}</Form.Label>
        {ready ? (
          <Stack gap={2} direction="horizontal">
            {/* readOnly, not disabled: a disabled input renders its text muted
                and cannot be selected, so the key is both hard to read and
                impossible to copy by hand. */}
            <BaseSecretField value={value} readOnly className="flex-grow-1" />
            <CopyToClipboardButton
              value={value}
              size={20}
              buttonClassName="btn btn-text-secondary btn-icon"
              onlyButton
            />
          </Stack>
        ) : status === 'error' ? (
          <div className="text-danger">
            {translate('Unable to reveal the API key.')}
          </div>
        ) : (
          <div className="d-flex align-items-center gap-2 text-muted">
            <LoadingSpinnerSimple /> {translate('Revealing…')}
          </div>
        )}
        <Form.Text className="text-muted">
          {translate(
            'Keep this key secret. You can reveal it again anytime, or rotate it if it is ever exposed.',
          )}
        </Form.Text>
      </Form.Group>
    </ModalDialog>
  );
};
