import { FC, useRef, useSyncExternalStore } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ModalShell } from '@/modal/ModalShell';

import { ReauthenticationCancelled } from './api';
import { canConfirmHere } from './methods';
import {
  getPendingReauthentication,
  ReauthenticationRequest,
  subscribeToReauthentication,
} from './prompt';

const ReauthenticationDialog = lazyComponent(() =>
  import('./ReauthenticationDialog').then((module) => ({
    default: module.ReauthenticationDialog,
  })),
);

/**
 * Shows "Confirm it's you" for each request the API refused with a step-up
 * challenge. A shell of its own on the confirm layer rather than openDialog:
 * the change being made is often in a dialog already (adding a passkey,
 * creating a token), and openDialog would replace that dialog with this one.
 */
export const ReauthenticationRoot: FC = () => {
  const pending = useSyncExternalStore(
    subscribeToReauthentication,
    getPendingReauthentication,
  );
  // The last request stays rendered while the dialog fades out.
  const lastRef = useRef<ReauthenticationRequest | null>(null);
  if (pending) {
    lastRef.current = pending;
  }
  const shown = pending ?? lastRef.current;

  // Cancel, Escape and the backdrop: the waiting request fails, and the
  // caller's error message says why.
  const cancel = () => {
    pending?.cancel(
      new ReauthenticationCancelled(
        canConfirmHere(pending.challenge)
          ? translate(
              'Nothing was changed, because your identity was not confirmed.',
            )
          : translate(
              'Nothing was changed: your account cannot confirm your identity. Please contact support.',
            ),
      ),
    );
  };

  return (
    <ModalShell
      open={Boolean(pending)}
      onHide={cancel}
      layer="confirm"
      title={translate("Confirm it's you")}
    >
      {shown ? (
        <ReauthenticationDialog
          // A fresh form for every request: each needs a grant of its own.
          key={shown.id}
          challenge={shown.challenge}
          onConfirm={shown.confirm}
        />
      ) : null}
    </ModalShell>
  );
};
