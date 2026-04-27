import { omit } from 'lodash-es';
import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { marketplaceProviderOfferingsUpdateOfferingComponent } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { formatComponent } from '@/marketplace/offerings/store/utils';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { TENANT_TYPE } from '@/openstack/constants';
import { showErrorResponse, showSuccess } from '@/store/notify';

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
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          const data = formatComponent(formData, props.resolve.offering);
          const { offering } = props.resolve;
          const payload =
            offering.type === TENANT_TYPE && props.resolve.component.is_builtin
              ? omit(data, ['name', 'measured_unit', 'type'])
              : data;
          await marketplaceProviderOfferingsUpdateOfferingComponent({
            path: { uuid: offering.uuid },
            body: payload,
          });
          dispatch(
            showSuccess(
              translate('Billing component has been updated successfully.'),
            ),
          );
          if (props.resolve.refetch) {
            await props.resolve.refetch();
          }
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(
              error,
              translate('Unable to update billing component.'),
            ),
          );
        }
      },
      [dispatch],
    );
    return (
      <form onSubmit={props.handleSubmit(update)}>
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
