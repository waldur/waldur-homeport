import { ChatsCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import {
  MatrixCredentials,
  matrixCredentialsPassword,
  matrixCredentialsRecoveryKey,
  matrixCredentialsRetrieve,
} from 'waldur-js-client';

import { BaseButton, PropertyItem, PropertyList } from 'waldur-ui';

import { ExternalLink } from '@/core/ExternalLink';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { OWN_ERROR_STATE } from '@/core/queryRetry';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { MaskedValue } from '@/property/propertyFields';

import { getMatrixRoomUrl } from './utils';

interface MatrixCredentialsDialogProps {
  resolve: {
    roomAlias: string;
  };
}

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
            <MaskedValue
              key={generation}
              value={password}
              name={translate('Password')}
            />
            <small className="text-quaternary block">
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
        className={password ? 'mt-1.5' : undefined}
      />
      {!password && (
        <small className="text-quaternary block mt-1.5">
          {translate(
            'Generating a password replaces any Matrix password set before.',
          )}
        </small>
      )}
    </>
  );
};

// The key that unlocks the user's encrypted history in another Matrix client.
// Fetched only when asked for, as each fetch is recorded, and kept only while
// the dialog is open.
const RecoveryKey: FC = () => {
  const [recoveryKey, setRecoveryKey] = useState<string | null>();
  const { mutate, isPending } = useManagedMutation({
    mutationFn: () =>
      matrixCredentialsRecoveryKey().then((r) => r.data.recovery_key),
    onSuccess: (key) => setRecoveryKey(key),
    errorMessage: translate('Unable to load your recovery key.'),
    closeModal: false,
    gcTime: 0,
  });
  if (recoveryKey === undefined) {
    return (
      <>
        <BaseButton
          label={translate('Show recovery key')}
          onClick={() => mutate(undefined)}
          pending={isPending}
          variant="secondary"
          size="sm"
        />
        <small className="text-quaternary block mt-1.5">
          {translate(
            'Your Matrix client asks for it to read your encrypted messages.',
          )}
        </small>
      </>
    );
  }
  if (recoveryKey === null) {
    return (
      <p className="text-quaternary mb-0">
        {translate(
          'Waldur holds no recovery key for you yet. Open the chat in Waldur first: it sets up encryption, or asks for the recovery key you already use in another Matrix app.',
        )}
      </p>
    );
  }
  return (
    <>
      <MaskedValue value={recoveryKey} name={translate('Recovery key')} />
      <small className="text-quaternary block">
        {translate(
          'Enter it when your Matrix client asks for a recovery key or security key. Anyone who has it can read your encrypted messages, so do not share it.',
        )}
      </small>
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
      <p className="text-quaternary">
        {translate('External Matrix clients are not enabled on this server.')}
      </p>
    );
  }

  // Sign-in details first, in the order a client asks for them; the room
  // last, next to the footer button that opens it.
  return (
    <PropertyList hideActions detailsMode>
      <PropertyItem
        label={translate('Homeserver')}
        value={credentials.homeserver_url}
        hasCopy
      />
      {credentials.method === 'password' && (
        <>
          <PropertyItem
            label={translate('Matrix user ID')}
            value={credentials.matrix_user_id}
            hasCopy
          />
          <PropertyItem
            label={translate('Password')}
            value={<GeneratedPassword />}
          />
        </>
      )}
      <PropertyItem label={translate('Recovery key')} value={<RecoveryKey />} />
      <PropertyItem
        label={translate('Room alias')}
        value={roomAlias}
        hasCopy
        hideIfEmpty
      />
    </PropertyList>
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
