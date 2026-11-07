import { TrashIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { FC, ReactNode, useState } from 'react';
import { OfferingDependentChangeEnum } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { OfferingDependentsWarning } from './OfferingDependentsWarning';
import { useOfferingDependents } from './useOfferingDependents';
import { getConflictDetail } from './utils';

export interface OfferingChangeDialogResolve {
  title: ReactNode;
  body: ReactNode;
  change: OfferingDependentChangeEnum;
  offeringUuid: string;
  planUuid?: string;
  componentType?: string;
  confirmLabel?: string;
  forDeletion?: boolean;
  mutationFn: () => Promise<unknown>;
  successMessage: string;
  errorMessage: string;
  onSuccess?: () => void;
}

/**
 * Confirms a change that may pull an offering, plan or component from under
 * what calls built on it: names what depends on it first, and keeps the
 * confirm disabled while that refuses the change for the viewer.
 */
export const OfferingChangeDialog: FC<{
  resolve: OfferingChangeDialogResolve;
}> = ({ resolve }) => {
  const { dependents, blocked, reason, isLoading } = useOfferingDependents(
    resolve.offeringUuid,
    resolve.change,
    { planUuid: resolve.planUuid, componentType: resolve.componentType },
  );
  const [conflict, setConflict] = useState<string>();
  const mutation = useManagedMutation<unknown, unknown, void>({
    mutationFn: resolve.mutationFn,
    successMessage: resolve.successMessage,
    errorMessage: resolve.errorMessage,
    onSuccess: resolve.onSuccess,
    onError: (error) => setConflict(getConflictDetail(error)),
  });
  const disabledReason = isLoading
    ? translate('Checking what depends on it…')
    : blocked
      ? reason
      : undefined;
  return (
    <ModalDialog
      title={resolve.title}
      iconNode={
        resolve.forDeletion ? (
          <TrashIcon weight="bold" />
        ) : (
          <WarningCircleIcon weight="bold" />
        )
      }
      iconColor={resolve.forDeletion ? 'danger' : 'warning'}
      bodyClassName="text-quaternary"
      footer={
        <>
          <CloseDialogButton className="flex-1 px-2.5" />
          <BaseButton
            variant={resolve.forDeletion ? 'danger' : 'primary'}
            className="flex-1 px-2.5"
            onClick={() => mutation.mutate()}
            disabled={isLoading || blocked || mutation.isPending}
            disabledReason={disabledReason}
            label={resolve.confirmLabel ?? translate('Yes')}
            size="lg"
            data-testid="offering-change-confirm"
          />
        </>
      }
    >
      <div>{resolve.body}</div>
      <OfferingDependentsWarning
        dependents={dependents}
        blocked={blocked}
        conflict={conflict}
        className="mt-3"
      />
    </ModalDialog>
  );
};
