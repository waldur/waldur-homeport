import { ProhibitIcon } from '@phosphor-icons/react';
import { FunctionComponent, useState } from 'react';
import { User, usersPartialUpdate } from 'waldur-js-client';

import { FormField, FormLabel } from 'waldur-ui';

import { SubmitButton } from '@/form';
import { BaseTextField } from '@/form/TextField';
import { formatJsxTemplate, translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface UserDeactivateDialogProps {
  resolve: { user: User; onDeactivated?: () => void };
}

export const UserDeactivateDialog: FunctionComponent<
  UserDeactivateDialogProps
> = ({ resolve: { user, onDeactivated } }) => {
  const [reason, setReason] = useState('');
  const trimmedReason = reason.trim();

  const { mutate, isPending } = useManagedMutation({
    mutationFn: () =>
      usersPartialUpdate({
        path: { uuid: user.uuid },
        body: {
          is_active: false,
          deactivation_reason: trimmedReason,
        },
      }),
    successMessage: translate('User has been deactivated.'),
    errorMessage: translate('Unable to deactivate user.'),
    invalidateQueries: [{ queryKey: ['User', user.uuid] }],
    onSuccess: () => onDeactivated?.(),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (trimmedReason) {
          mutate();
        }
      }}
    >
      <ModalDialog
        title={translate('Deactivate user')}
        subtitle={translate(
          'Deactivate {name}',
          { name: <strong>{user.full_name || user.username}</strong> },
          formatJsxTemplate,
        )}
        iconNode={<ProhibitIcon weight="bold" />}
        iconColor="danger"
        footer={
          <>
            <CloseDialogButton className="flex-1" />
            <SubmitButton
              submitting={isPending}
              disabled={!trimmedReason}
              disabledReason={
                !trimmedReason
                  ? translate('A reason is required to deactivate a user.')
                  : undefined
              }
              variant="danger"
              className="flex-1"
              label={translate('Deactivate')}
            />
          </>
        }
      >
        <p className="text-quaternary text-sm">
          {translate(
            'The account will be deactivated and will not be reactivated automatically by the system, even if the user regains roles. A staff member can reactivate it manually.',
          )}
        </p>
        <FormField>
          <FormLabel required>{translate('Reason')}</FormLabel>
          <BaseTextField
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={translate('Why is this user being deactivated?')}
            autoFocus
          />
        </FormField>
      </ModalDialog>
    </form>
  );
};
