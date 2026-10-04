import { ChatsCircleIcon, EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { MatrixCredentials, matrixCredentialsRetrieve } from 'waldur-js-client';

import { BaseButton, buttonVariants } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { getMatrixRoomUrl } from './utils';

interface MatrixCredentialsDialogProps {
  resolve: {
    roomAlias: string;
  };
}

// Copy never requires revealing first; Reveal is for retyping by hand.
const CredentialRow: FC<{ label: string; value: string; masked?: boolean }> = ({
  label,
  value,
  masked,
}) => {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="d-flex align-items-center justify-content-between mb-3 p-3 border rounded">
      <div className="text-break me-3">
        <small className="text-muted d-block">{label}</small>
        <code>{masked && !revealed ? '\u2022'.repeat(12) : value}</code>
      </div>
      <div className="d-flex align-items-center flex-shrink-0">
        {masked && (
          <BaseButton
            iconNode={
              revealed ? (
                <EyeSlashIcon weight="bold" />
              ) : (
                <EyeIcon weight="bold" />
              )
            }
            tooltip={revealed ? translate('Hide') : translate('Reveal')}
            onClick={() => setRevealed(!revealed)}
            variant="text-secondary"
            size="lg"
          />
        )}
        <CopyToClipboardButton value={value} />
      </div>
    </div>
  );
};

const CredentialsContent: FC<{
  credentials: MatrixCredentials;
  roomAlias: string;
}> = ({ credentials, roomAlias }) => {
  const matrixRoomUrl = getMatrixRoomUrl(roomAlias);
  const sso = credentials.method === 'oidc';

  // An admin may have switched external clients off since this page loaded.
  if (credentials.method === 'none') {
    return (
      <p className="text-muted">
        {translate('External Matrix clients are not enabled on this server.')}
      </p>
    );
  }

  return (
    <div>
      <p className="text-muted">
        {sso
          ? translate(
              'This server uses single sign-on. In your Matrix client, enter the homeserver below and sign in with single sign-on.',
            )
          : translate(
              'Sign in to your Matrix client with these details. Treat the password like any other.',
            )}
      </p>
      {roomAlias && (
        <CredentialRow label={translate('Room alias')} value={roomAlias} />
      )}
      <CredentialRow
        label={translate('Homeserver')}
        value={credentials.homeserver_url}
      />
      {!sso && (
        <CredentialRow
          label={translate('Matrix user ID')}
          value={credentials.matrix_user_id}
        />
      )}
      {credentials.password && (
        <CredentialRow
          label={translate('Password')}
          value={credentials.password}
          masked
        />
      )}

      {matrixRoomUrl && (
        <div className="mt-4">
          <a
            href={matrixRoomUrl}
            className={`${buttonVariants({ variant: 'primary' })} w-100`}
            target="_blank"
            rel="noreferrer"
          >
            <ChatsCircleIcon className="me-2" weight="bold" />
            {translate('Open in Matrix client')}
          </a>
          <small className="text-muted d-block text-center mt-1">
            {translate(
              'Opens matrix.to, which hands the room over to your Matrix client.',
            )}
          </small>
        </div>
      )}
    </div>
  );
};

export const MatrixCredentialsDialog: FC<MatrixCredentialsDialogProps> = ({
  resolve,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['matrixCredentials'],
    queryFn: () => matrixCredentialsRetrieve().then((r) => r.data),
    // The password does not expire, so keep it only while the dialog shows it.
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  return (
    <ModalDialog
      title={translate('Connect to Matrix')}
      footer={<CloseDialogButton />}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load Matrix credentials.')}
          loadData={refetch}
        />
      ) : (
        <CredentialsContent credentials={data} roomAlias={resolve.roomAlias} />
      )}
    </ModalDialog>
  );
};
