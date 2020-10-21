import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { withTranslation } from '@waldur/i18n';
import { isStaff, isOwner } from '@waldur/workspace/selectors';

import { canManageCustomer } from '../create/selectors';

import { CustomerLogoUpdate } from './CustomerLogoUpdate';
import * as actions from './store/actions';

const mapStateToProps = (state) => ({
  formData: getFormValues('customerLogo')(state),
  canEdit: isStaff(state) || (isOwner(state) && canManageCustomer(state)),
});

const mapDispatchToProps = (dispatch, props) => ({
  uploadLogo: (formData) =>
    actions.uploadLogo(
      { customerUuid: props.customer.uuid, image: formData.image },
      dispatch,
    ),
  removeLogo: () => actions.removeLogo({ customer: props.customer }, dispatch),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation,
);

export const CustomerLogoUpdateContainer = enhance(CustomerLogoUpdate);
