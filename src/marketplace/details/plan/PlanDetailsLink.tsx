import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
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
  <Button
    variant="link"
    className="btn-flush"
    onClick={props.showPlanDetailsDialog}
  >
    {translate('Show')}
  </Button>
);

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  showPlanDetailsDialog: () =>
    dispatch(showPlanDetailsDialog(ownProps.resource)),
});

export const PlanDetailsLink = connect(
  null,
  mapDispatchToProps,
)(PurePlanDetailsLink);
