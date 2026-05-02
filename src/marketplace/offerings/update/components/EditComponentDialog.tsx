import { omit } from 'lodash-es';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { marketplaceProviderOfferingsUpdateOfferingComponent } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { formatComponent } from '@/marketplace/offerings/store/utils';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { TENANT_TYPE } from '@/openstack/constants';

import { parseComponent } from '../utils';

import { ComponentForm } from './ComponentForm';
import { EDIT_COMPONENT_FORM_ID } from './constants';

type OwnProps = { resolve: { offering; component; refetch } };

export const EditComponentDialog = connect<{}, {}, OwnProps>((_, ownProps) => ({
  initialValues: parseComponent(
    ownProps.resolve.component,
    ownProps.resolve.offering,
  ),
}))(
  reduxForm<{}, OwnProps>({
    form: EDIT_COMPONENT_FORM_ID,
  })((props) => {
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
      <form
        onSubmit={props.handleSubmit((values) =>
          updateMutation.mutateAsync(values),
        )}
      >
        <ModalDialog
          title={translate('Edit component')}
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Save')}
            />
          }
        >
          <ComponentForm offering={props.resolve.offering} />
        </ModalDialog>
      </form>
    );
  }),
);
