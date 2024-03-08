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
  <button
    className="text-btn text-dark"
    type="button"
    onClick={props.showPlanDetailsDialog}
  >
    {translate('Show')} <i className="fa fa-external-link" />
  </button>
);

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  showPlanDetailsDialog: () =>
    dispatch(showPlanDetailsDialog(ownProps.resource)),
});

export const PlanDetailsLink = connect(
  null,
  mapDispatchToProps,
)(PurePlanDetailsLink);
