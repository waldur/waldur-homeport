import { ChatsCircleIcon, EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import {
  MatrixCredentials,
  matrixCredentialsPassword,
  matrixCredentialsRetrieve,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { ExternalLink } from '@/core/ExternalLink';
import { FieldWithCopy } from '@/core/FieldWithCopy';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { OWN_ERROR_STATE } from '@/core/queryRetry';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { getMatrixRoomUrl } from './utils';

interface MatrixCredentialsDialogProps {
  resolve: {
    roomAlias: string;
  };
}

// Laid out like FieldWithCopy, which copies what it shows; here the copy must
// not need revealing first. Reveal is for retyping by hand.
const MaskedPassword: FC<{ value: string }> = ({ value }) => {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="d-flex justify-content-between align-items-center">
      <span className="text-break">{revealed ? value : '•'.repeat(12)}</span>
      <div className="d-flex align-items-center flex-shrink-0">
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
          size="sm"
        />
        <CopyToClipboardButton
          value={value}
          size={20}
          className="mb-0 mt-0"
          buttonClassName="text-gray-500"
        />
      </div>
    </div>
  );
};

// Waldur keeps no Matrix password, so the user generates one and sees it only
// here; generating again replaces it on the homeserver.
const GeneratedPassword: FC = () => {
  // Each mutate starts a fresh mutation with no data yet, so the last password
  // is held here to stay visible while regenerating or if that fails.
  const [password, setPassword] = useState<string>();
  const [generation, setGeneration] = useState(0);
  const { mutate, isPending } = useManagedMutation({
    mutationFn: () => matrixCredentialsPassword().then((r) => r.data.password),
    onSuccess: (generated) => {
      setPassword(generated);
      setGeneration((count) => count + 1);
    },
    errorMessage: translate('Unable to generate a Matrix password.'),
    closeModal: false,
    // The password does not expire, so it is not kept past the dialog.
    gcTime: 0,
  });
  return (
    <>
      {/* Rendered before any password so screen readers pick up the first one;
          the key remounts the value so a new, still-masked password is
          announced too. */}
      <div aria-live="polite">
        {password && (
          <>
            <MaskedPassword key={generation} value={password} />
            <small className="text-muted d-block">
              {translate('Copy it now: it will not be shown again.')}
            </small>
          </>
        )}
      </div>
      {/* One button in one place, so focus stays on it when the label changes. */}
      <BaseButton
        label={
          password
            ? translate('Generate a new password')
            : translate('Generate password')
        }
        onClick={() => mutate(undefined)}
        pending={isPending}
        variant={password ? 'tertiary' : 'secondary'}
        size="sm"
        className={password ? 'mt-2' : undefined}
      />
      {!password && (
        <small className="text-muted d-block mt-2">
          {translate(
            'Generating a password replaces any Matrix password set before.',
          )}
        </small>
      )}
    </>
  );
};

const CredentialsContent: FC<{
  credentials: MatrixCredentials;
  roomAlias: string;
}> = ({ credentials, roomAlias }) => {
  // An admin may have switched external clients off since this page loaded.
  if (credentials.method === 'none') {
    return (
      <p className="text-muted">
        {translate('External Matrix clients are not enabled on this server.')}
      </p>
    );
  }

  // Sign-in details first, in the order a client asks for them; the room
  // last, next to the footer button that opens it.
  return (
    <FormTable hideActions detailsMode className="gy-5">
      <FormTable.Item
        label={translate('Homeserver')}
        value={<FieldWithCopy value={credentials.homeserver_url} />}
      />
      {credentials.method === 'password' && (
        <>
          <FormTable.Item
            label={translate('Matrix user ID')}
            value={<FieldWithCopy value={credentials.matrix_user_id} />}
          />
          <FormTable.Item
            label={translate('Password')}
            value={<GeneratedPassword />}
          />
        </>
      )}
      {roomAlias && (
        <FormTable.Item
          label={translate('Room alias')}
          value={<FieldWithCopy value={roomAlias} />}
        />
      )}
    </FormTable>
  );
};

const getIntro = (method?: MatrixCredentials['method']) => {
  if (method === 'password') {
    return translate('Sign in to your Matrix client with these details.');
  }
  if (method === 'oidc') {
    return translate(
      'In your Matrix client, enter the homeserver and sign in with single sign-on.',
    );
  }
};

export const MatrixCredentialsDialog: FC<MatrixCredentialsDialogProps> = ({
  resolve,
}) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['matrixCredentials'],
    queryFn: () => matrixCredentialsRetrieve().then((r) => r.data),
    // Each opening starts with nothing kept: credentials from an earlier one
    // could be out of date, or another user's once staff impersonates someone.
    gcTime: 0,
    meta: OWN_ERROR_STATE,
  });
  const matrixRoomUrl =
    data && data.method !== 'none' ? getMatrixRoomUrl(resolve.roomAlias) : null;

  return (
    <ModalDialog
      title={translate('Connect to Matrix')}
      subtitle={getIntro(data?.method)}
      iconNode={<ChatsCircleIcon weight="bold" />}
      footer={
        <>
          <CloseDialogButton label={translate('Close')} />
          {matrixRoomUrl && (
            <ExternalLink
              url={matrixRoomUrl}
              label={translate('Open in Matrix client')}
              buttonVariant="primary"
              buttonSize="lg"
            />
          )}
        </>
      }
    >
      {/* Credentials already shown stay when a refetch fails (the query
          refetches when the window regains focus): the error state in their
          place would drop a generated password, which is shown only once. */}
      {isLoading ? (
        <LoadingSpinner />
      ) : data ? (
        <CredentialsContent credentials={data} roomAlias={resolve.roomAlias} />
      ) : (
        <LoadingErred
          message={translate('Unable to load Matrix credentials.')}
          loadData={refetch}
        />
      )}
    </ModalDialog>
  );
};
