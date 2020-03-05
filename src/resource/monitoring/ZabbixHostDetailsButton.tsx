import * as React from 'react';
import { connect } from 'react-redux';

import { openDetailsDialog } from './actions';

interface OwnProps {
  host: any;
  label: React.ReactNode;
  textClass: string;
}

interface DispatchProps {
  onOpenDetailsDialog(): void;
}

const PureZabbixHostDetailsButton = props => (
  <a className="btn btn-default btn-xs" onClick={props.onOpenDetailsDialog}>
    <i className={`${props.textClass} fa fa-line-chart`} /> {props.label}
  </a>
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  onOpenDetailsDialog: () => dispatch(openDetailsDialog(ownProps.host)),
});

const connector = connect<{}, DispatchProps, OwnProps>(
  null,
  mapDispatchToProps,
);

export const ZabbixHostDetailsButton = connector(PureZabbixHostDetailsButton);
