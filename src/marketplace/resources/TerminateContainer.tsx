import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { connectAngularComponent } from '@waldur/store/connect';

import { orderCanBeApproved } from '../orders/store/selectors';
import { terminateResource } from './store/constants';
import { PureTerminateDialog } from './TerminateDialog';

const mapStateToProps = state => ({
  orderCanBeApproved: orderCanBeApproved(state),
});

const mapDispatchToProps = (dispatch, ownProps: any) => ({
  submitRequest: () => terminateResource({
    resource_uuid: ownProps.resolve.resource.marketplace_resource_uuid,
  }, dispatch),
});

const connector = compose(
  reduxForm({form: 'TerminateResourceDialog'}),
  connect(mapStateToProps, mapDispatchToProps),
);

const TerminateDialog = connector(PureTerminateDialog);

export default connectAngularComponent(TerminateDialog, ['resolve']);
