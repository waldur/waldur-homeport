import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

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

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const CustomerLogoUpdateContainer = enhance(CustomerLogoUpdate);
