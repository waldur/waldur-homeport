import { Form } from 'react-final-form';
import {
  RemoteProject,
  MembershipControlEnum,
  openportalRemoteProjectsSetMembershipControl,
} from 'waldur-js-client';

import { SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface MembershipControlOption {
  value: MembershipControlEnum | null;
  label: string;
}

const OPTIONS: MembershipControlOption[] = [
  { value: null, label: translate('Open (default)') },
  { value: 'open', label: translate('Open') },
  { value: 'members_only', label: translate('Members only') },
  { value: 'roles_only', label: translate('Roles only') },
  { value: 'locked', label: translate('Locked') },
];

interface FormValues {
  membership_control: MembershipControlOption;
}

interface SetMembershipControlDialogProps {
  row: RemoteProject;
  resolve: {
    refetch: () => Promise<void> | void;
  };
}

export const SetMembershipControlDialog: React.FC<
  SetMembershipControlDialogProps
> = ({ row, resolve }) => {
  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      openportalRemoteProjectsSetMembershipControl({
        path: { uuid: row.uuid },
        body: { membership_control: values.membership_control?.value ?? null },
      }),
    successMessage: translate('Membership control has been updated.'),
    errorMessage: translate('Unable to update membership control.'),
    refetch: resolve.refetch,
  });

  const initialOption =
    OPTIONS.find(
      (o) => o.value === (row.membership_control ?? null) && o.value !== null,
    ) ?? OPTIONS[0];

  return (
    <Form<FormValues>
      onSubmit={(values) => mutation.mutateAsync(values)}
      initialValues={{ membership_control: initialOption }}
      subscription={{ submitting: true, invalid: true }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalDialog
            title={translate('Set membership control')}
            footer={
              <SubmitButton
                submitting={submitting}
                invalid={invalid}
                label={translate('Save')}
              />
            }
          >
            <SelectGroup
              name="membership_control"
              label={translate('Membership control')}
              description={translate(
                'Controls whether the receiving portal may independently modify project membership or roles.',
              )}
              options={OPTIONS.filter((o) => o.value !== null)}
              getOptionValue={(o: MembershipControlOption) => o.value}
              getOptionLabel={(o: MembershipControlOption) => o.label}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
