import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';

import { showPlanDetailsDialog } from './actions';

interface OwnProps {
  resource: string;
}

interface DispatchProps {
  showPlanDetailsDialog(): void;
}

type Props = OwnProps & DispatchProps;

const PurePlanDetailsLink: FunctionComponent<Props> = (props) => (
  <a onClick={props.showPlanDetailsDialog}>
    {translate('Show')} <i className="fa fa-external-link" />
  </a>
);

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  showPlanDetailsDialog: () =>
    dispatch(showPlanDetailsDialog(ownProps.resource)),
});

export const PlanDetailsLink = connect(
  null,
  mapDispatchToProps,
)(PurePlanDetailsLink);
