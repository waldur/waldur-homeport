import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { orderCanBeApproved } from '@waldur/marketplace/orders/store/selectors';
import { RootState } from '@waldur/store/reducers';

import { terminateResource } from '../store/constants';

import { TerminateDialog } from './TerminateDialog';
import { TerminateDialogOwnProps } from './types';

const mapStateToProps = (state: RootState) => ({
  orderCanBeApproved: orderCanBeApproved(state),
});

const mapDispatchToProps = (dispatch, ownProps: any) => ({
  submitRequest: () =>
    terminateResource(
      {
        resource: ownProps.asyncState.value,
        refetch: ownProps.refetch,
      },
      dispatch,
    ),
});

const connector = compose(
  reduxForm<{}, TerminateDialogOwnProps>({
    form: 'TerminateResourceDialog',
  }),
  connect<
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    TerminateDialogOwnProps
  >(mapStateToProps, mapDispatchToProps),
);

export const TerminateContainer = connector(TerminateDialog);
