import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import { marketplaceProviderOfferingsMoveOffering } from 'waldur-js-client';

import { FormFooter } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { MoveOfferingFields } from './MoveOfferingFields';

export const MoveOfferingDialog: FunctionComponent<{
  resolve: { offering; refetch };
}> = ({ resolve: { offering, refetch } }) => {
  const { showSuccess } = useNotify();

  const moveOfferingMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsMoveOffering({
        path: { uuid: offering.uuid },
        body: {
          customer: formData.organization.url,
          preserve_permissions: formData.preserve_permissions,
        },
      }),
    errorMessage: translate('Offering could not be moved.'),
    refetch,
    onSuccess: (_data, variables) => {
      showSuccess(
        translate(
          '{offeringName} offering has been moved to {organizationName} organization.',
          {
            offeringName: offering.name,
            organizationName: variables.organization.name,
          },
        ),
      );
    },
  });

  return (
    <Form
      onSubmit={(values) => moveOfferingMutation.mutateAsync(values)}
      initialValues={{ preserve_permissions: false }}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Move offering')}
            subtitle={
              <ScopeSubtitle
                label={translate('Offering name')}
                name={offering.name}
              />
            }
            footer={<FormFooter submitLabel={translate('Save')} />}
          >
            <MoveOfferingFields submitting={submitting} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
