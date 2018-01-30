import * as React from 'react';
import { connect } from 'react-redux';

import { openDetailsDialog } from './actions';

interface ZabbixHostDetailsButtonProps {
  host: any;
  label: React.ReactNode;
  textClass: string;
}

const PureZabbixHostDetailsButton = props => (
  <a className="btn btn-default btn-xs" onClick={props.onOpenDetailsDialog}>
    <i className={`${props.textClass} fa fa-line-chart`}/>
    {' '}
    {props.label}
  </a>
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  onOpenDetailsDialog: () => dispatch(openDetailsDialog(ownProps.host)),
});

export const ZabbixHostDetailsButton: React.ComponentType<ZabbixHostDetailsButtonProps> =
  connect(null, mapDispatchToProps)(PureZabbixHostDetailsButton);
