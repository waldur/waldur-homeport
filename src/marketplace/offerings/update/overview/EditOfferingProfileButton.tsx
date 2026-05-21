import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import { useSelector } from 'react-redux';
import {
  marketplaceOfferingProfilesList,
  marketplaceProviderOfferingsSetProfile,
} from 'waldur-js-client';

import { SelectField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';
import { getUser } from '@/workspace/selectors';

import { FormGroup } from '../../FormGroup';

interface DialogResolve {
  offering: { uuid: string; profile_uuid?: string | null };
  refetch(): void;
}

const Dialog: FC<{ resolve: DialogResolve }> = ({ resolve }) => {
  const { data: profiles = [] } = useQuery({
    queryKey: ['offering-profiles-options'],
    queryFn: () =>
      marketplaceOfferingProfilesList().then((r: any) => r.data || []),
  });

  const options = [
    { value: '', label: translate('— None (custom roles) —') },
    ...profiles.map((p: any) => ({ value: p.uuid, label: p.name })),
  ];

  const initial = options.find(
    (o) => o.value === (resolve.offering.profile_uuid || ''),
  );

  const mutation = useManagedMutation<any, any, any>({
    mutationFn: (values) =>
      marketplaceProviderOfferingsSetProfile({
        path: { uuid: resolve.offering.uuid },
        body: { profile: values.profile?.value || null } as any,
      }),
    successMessage: translate('Service profile updated.'),
    errorMessage: translate('Unable to update service profile.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) =>
        mutation.mutateAsync(values).catch(() => {
          /* error handled by useManagedMutation */
        })
      }
      initialValues={{ profile: initial }}
    >
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Set service profile')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                  className="btn btn-primary"
                />
              </>
            }
          >
            <FormGroup
              label={translate('Service profile')}
              description={translate(
                'Bind this offering to a profile to use its centrally-managed role catalog. Setting to "None" lets you manage roles per-offering.',
              )}
            >
              <Field
                name="profile"
                component={SelectField}
                options={options}
                getOptionValue={(o) => o.value}
                getOptionLabel={(o) => o.label}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};

export const EditOfferingProfileButton: FC<{
  offering;
  refetch();
}> = ({ offering, refetch }) => {
  const { openDialog } = useModal();
  const user = useSelector(getUser);
  if (!user?.is_staff) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Edit')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={() =>
        openDialog(Dialog, {
          resolve: { offering, refetch },
        })
      }
    />
  );
};
