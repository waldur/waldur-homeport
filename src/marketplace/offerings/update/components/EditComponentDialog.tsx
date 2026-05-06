import { omit } from 'lodash-es';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { marketplaceProviderOfferingsUpdateOfferingComponent } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { formatComponent } from '@/marketplace/offerings/store/utils';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { TENANT_TYPE } from '@/openstack/constants';

import { parseComponent } from '../utils';

import { ComponentForm } from './ComponentForm';

export const EditComponentDialog: FC<{
  resolve: { offering; component; refetch };
}> = (props) => {
  const initialValues = useMemo(
    () => parseComponent(props.resolve.component, props.resolve.offering),
    [props.resolve.component, props.resolve.offering],
  );

  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      const data = formatComponent(formData, props.resolve.offering);
      const { offering } = props.resolve;
      const payload =
        offering.type === TENANT_TYPE && props.resolve.component.is_builtin
          ? omit(data, ['name', 'measured_unit', 'type'])
          : data;
      return marketplaceProviderOfferingsUpdateOfferingComponent({
        path: { uuid: offering.uuid },
        body: payload,
      });
    },
    successMessage: translate(
      'Billing component has been updated successfully.',
    ),
    errorMessage: translate('Unable to update billing component.'),
    refetch: props.resolve.refetch,
  });

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit component')}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Save')}
              />
            }
          >
            <ComponentForm offering={props.resolve.offering} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
