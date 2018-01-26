import * as React from 'react';
import { connect } from 'react-redux';

import { withTranslation, TranslateProps } from '@waldur/i18n';

import { fetchMonitoring, openDetailsDialog, openCreateDialog } from './actions';
import { getMonitoringState } from './selectors';

interface ResourceMonitoringIndicatorProps extends TranslateProps {
  resource: any;
  onFetch: () => void;
  onOpenDetailsDialog: (host: any) => void;
  onOpenCreateDialog: () => void;
  loading: boolean;
  erred: boolean;
  host?: any;
}

class PureResourceMonitoringIndicator extends React.Component<ResourceMonitoringIndicatorProps> {
  render() {
    if (this.props.loading) {
      return (
        <>
          {this.props.translate('Fetching data.')}
          <i className="text-info fa fa-spinner fa-spin"/>
        </>
      );
    }
    if (this.props.erred) {
      return this.props.translate('Unable to load monitoring data');
    }
    if (!this.props.host) {
      return (
        <a onClick={this.props.onOpenCreateDialog}>
          {this.props.translate('Resource is not monitored yet.')}
        </a>
      );
    }
    return (
      <a onClick={() => this.props.onOpenDetailsDialog(this.props.host)}>
        {this.renderState()}
      </a>
    );
  }

  renderState() {
    switch (this.props.host.state) {

      case 'OK':
        return this.props.translate('Resource is monitored using Zabbix.');

      case 'Erred':
        return this.props.translate('Monitoring system has failed.');

      case 'Creation Scheduled':
      case 'Creating':
        return this.props.translate('Monitoring system is being provisioned.');

      case 'Update Scheduled':
      case 'Updating':
        return this.props.translate('Monitoring system is being updated.');

      case 'Deletion Scheduled':
      case 'Deleting':
        return this.props.translate('Monitoring system is being deleted.');
    }
  }

  componentWillMount() {
    this.props.onFetch();
  }
}

const mapStateToProps = state => getMonitoringState(state);

const mapStateToDispatch = (dispatch, ownProps) => ({
  onFetch: () => dispatch(fetchMonitoring(ownProps.resource.url)),
  onOpenDetailsDialog: host => dispatch(openDetailsDialog(host)),
  onOpenCreateDialog: () => dispatch(openCreateDialog(ownProps.resource)),
});

export const ResourceMonitoringIndicator = connect(mapStateToProps, mapStateToDispatch)(withTranslation(PureResourceMonitoringIndicator));
