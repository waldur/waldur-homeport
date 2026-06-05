import { ChatsCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { MatrixCredentials, matrixCredentialsRetrieve } from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface MatrixCredentialsDialogProps {
  resolve: {
    roomAlias: string;
    roomUuid?: string;
  };
}

const CredentialRow: FC<{ label: string; value: string; masked?: boolean }> = ({
  label,
  value,
  masked,
}) => (
  <div className="d-flex align-items-center justify-content-between mb-3 p-3 border rounded">
    <div>
      <small className="text-muted d-block">{label}</small>
      <code>{masked ? '\u2022'.repeat(12) : value}</code>
    </div>
    <CopyToClipboardButton value={value} />
  </div>
);

const CredentialsContent: FC<{
  credentials: MatrixCredentials;
  roomAlias: string;
}> = ({ credentials, roomAlias }) => {
  const matrixUri = roomAlias
    ? `matrix:r/${roomAlias.replace(/^#/, '')}`
    : null;

  return (
    <div>
      {roomAlias && (
        <CredentialRow label={translate('Room alias')} value={roomAlias} />
      )}
      <CredentialRow
        label={translate('Homeserver')}
        value={credentials.homeserver_url}
      />
      <CredentialRow
        label={translate('Matrix user ID')}
        value={credentials.matrix_user_id}
      />

      {credentials.method === 'password' && credentials.password && (
        <CredentialRow
          label={translate('Password')}
          value={credentials.password}
          masked
        />
      )}

      {credentials.method === 'token' && credentials.login_token && (
        <CredentialRow
          label={translate('Access token')}
          value={credentials.login_token}
          masked
        />
      )}

      {credentials.method === 'oidc' && credentials.oidc_provider_url && (
        <div className="mb-3">
          <p className="text-muted">
            {translate(
              'This server uses single sign-on. Open your Matrix client and sign in via SSO.',
            )}
          </p>
        </div>
      )}

      {matrixUri && (
        <div className="mt-4">
          <a
            href={matrixUri}
            className="btn btn-primary w-100"
            target="_blank"
            rel="noreferrer"
          >
            <ChatsCircleIcon className="me-2" weight="bold" />
            {translate('Open in Matrix client')}
          </a>
          <small className="text-muted d-block text-center mt-1">
            {translate('Opens in your default Matrix client if configured.')}
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
    queryKey: ['matrixCredentials', resolve.roomUuid],
    queryFn: () =>
      matrixCredentialsRetrieve(
        resolve.roomUuid
          ? ({ query: { room_uuid: resolve.roomUuid } } as any)
          : undefined,
      ).then((r) => r.data),
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
