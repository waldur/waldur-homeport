import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation, TranslateProps } from '@waldur/i18n';

import { fetchMonitoring } from './actions';
import { getMonitoringState } from './selectors';
import { ZabbixHostCreateButton } from './ZabbixHostCreateButton';
import { ZabbixHostStateButton } from './ZabbixHostStateButton';

interface ResourceMonitoringIndicatorProps extends TranslateProps {
  resource: any;
  onFetch: () => void;
  loading: boolean;
  erred: boolean;
  host?: any;
}

const LoadingPlaceholder = withTranslation(props => (
  <>
    <i className="text-info fa fa-spinner fa-spin"/>
    {' '}
    {props.translate('Fetching data.')}
  </>
));

const ErredPlaceholder = withTranslation(props => (
  <>
    <i className="text-danger fa fa-line-chart"/>
    {' '}
    {props.translate('Unable to load monitoring data.')}
  </>
));

class PureResourceMonitoringIndicator extends React.Component<ResourceMonitoringIndicatorProps> {
  render() {
    const { loading, erred, resource, host } = this.props;

    if (loading) {
      return <LoadingPlaceholder/>;
    }

    if (erred) {
      return <ErredPlaceholder/>;
    }

    if (!host) {
      return <ZabbixHostCreateButton resource={resource}/>;
    }

    return <ZabbixHostStateButton host={host}/>;
  }

  componentWillMount() {
    this.props.onFetch();
  }
}

const mapStateToDispatch = (dispatch, ownProps) => ({
  onFetch: () => dispatch(fetchMonitoring(ownProps.resource.url)),
});

const enhance = compose(connect(getMonitoringState, mapStateToDispatch), withTranslation);

export const ResourceMonitoringIndicator = enhance(PureResourceMonitoringIndicator);
