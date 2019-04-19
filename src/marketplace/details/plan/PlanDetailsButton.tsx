import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import ActionButton from '@waldur/table-react/ActionButton';

import { showPlanDetailsDialog } from './actions';

interface OwnProps {
  resource: string;
}

interface DispatchProps {
  showPlanDetailsDialog(): void;
}

type Props = OwnProps & DispatchProps;

const PurePlanDetailsButton = (props: Props) => (
  <ActionButton
    title={translate('Plan details')}
    action={props.showPlanDetailsDialog}
  />
);

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  showPlanDetailsDialog: () => dispatch(showPlanDetailsDialog(ownProps.resource)),
});

export const PlanDetailsButton = connect(null, mapDispatchToProps)(PurePlanDetailsButton);

export default connectAngularComponent(PlanDetailsButton, ['resource']);
