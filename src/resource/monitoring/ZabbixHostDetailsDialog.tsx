import React from 'react';
import { Col, Tab, Tabs } from 'react-bootstrap';
import { connect } from 'react-redux';
import { useEffectOnce } from 'react-use';
import { compose } from 'redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { ResourceDetailsTable } from '../summary/ResourceDetailsTable';

import { fetchZabbixHost } from './actions';
import { getMonitoringState } from './selectors';
import { ZabbixHost } from './types';
import { ZabbixHostDeleteButton } from './ZabbixHostDeleteButton';
import { ZabbixHostSummary } from './ZabbixHostSummary';

interface ZabbixHostDetailsDialogProps extends TranslateProps {
  resolve: {
    resource: any;
  };
  loading: boolean;
  erred: boolean;
  onFetch: () => void;
  host?: ZabbixHost;
}

const DialogFooter = ({ host }) => (
  <>
    <ZabbixHostDeleteButton host={host} /> <CloseDialogButton />
  </>
);

export const DialogBody = (props) => {
  if (props.loading) {
    return <LoadingSpinner />;
  } else if (props.host) {
    let defaultTab = 1;
    if (props.host.state === 'OK') {
      defaultTab = 2;
    }
    return (
      <Tabs defaultActiveKey={defaultTab} id="monitoringDetails">
        <Tab eventKey={1} title={props.translate('Details')}>
          <div className="row m-t-md">
            <Col sm={12}>
              <ResourceDetailsTable>
                <ZabbixHostSummary resource={props.host} />
              </ResourceDetailsTable>
            </Col>
          </div>
        </Tab>
        <Tab eventKey={2} title={props.translate('Charts')}>
          TODO.
        </Tab>
      </Tabs>
    );
  } else {
    return props.translate('Unable to load Zabbix host details.');
  }
};

const PureZabbixHostDetailsDialog: React.FC<ZabbixHostDetailsDialogProps> = (
  props,
) => {
  useEffectOnce(props.onFetch);
  return (
    <ModalDialog
      title={props.translate('Monitoring details')}
      footer={<DialogFooter host={props.host} />}
    >
      <DialogBody {...props} />
    </ModalDialog>
  );
};

const mapStateToDispatch = (dispatch, ownProps) => ({
  onFetch: () => dispatch(fetchZabbixHost(ownProps.resolve.resource.uuid)),
});

const enhance = compose(
  connect(getMonitoringState, mapStateToDispatch),
  withTranslation,
);

export const ZabbixHostDetailsDialog = enhance(PureZabbixHostDetailsDialog);
