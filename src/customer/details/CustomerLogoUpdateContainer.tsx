import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { withTranslation } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { CustomerLogoUpdate } from './CustomerLogoUpdate';
import * as actions from './store/actions';

const mapStateToProps = (state: RootState) => ({
  formData: getFormValues('ServiceProviderEditor')(state),
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
