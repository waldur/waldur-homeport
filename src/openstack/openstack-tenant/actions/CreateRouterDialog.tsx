import { FC } from 'react';
import { Form } from 'react-final-form';
import { openstackRoutersCreate, OpenStackTenant } from 'waldur-js-client';

import { NameGroup } from '@/form/NameGroup';
import { translate } from '@/i18n';
import { ActionDialogFinal } from '@/modal/ActionDialogFinal';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionDialogProps } from '@/resource/actions/types';

export const CreateRouterDialog: FC<ActionDialogProps<OpenStackTenant>> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, { name: string }>({
    mutationFn: (formData) =>
      openstackRoutersCreate({
        body: {
          name: formData.name,
          tenant: resource.url,
        },
      }),
    successMessage: translate('OpenStack router has been created.'),
    errorMessage: translate('Unable to create OpenStack router.'),
    refetch,
  });

  return (
    <Form<{ name: string }>
      onSubmit={(values) => mutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <ActionDialogFinal
          title={translate('Create new router')}
          onSubmit={handleSubmit}
          submitting={submitting}
          invalid={invalid}
        >
          <NameGroup />
        </ActionDialogFinal>
      )}
    />
  );
};
