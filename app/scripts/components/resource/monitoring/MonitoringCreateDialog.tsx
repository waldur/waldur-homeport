import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { SelectAsyncField } from '@waldur/form-react';
import { withTranslation } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import * as actions from './actions';

// tslint:disable-next-line
const MonitoringGuide = require('./MonitoringGuide.md');

const MonitoringCreateDialog = props => (
  <ActionDialog
    title={props.translate('Create Zabbix host')}
    submitLabel={props.translate('Create Zabbix host')}
    onSubmit={props.handleSubmit(props.createHost)}
    submitting={props.submitting}
    error={props.error}>
    <SelectAsyncField
      name="service_project_link"
      label={props.translate('Zabbix provider')}
      required={true}
      clearable={false}
      labelKey="service_name"
      valueKey="url"
      loadOptions={props.loadProviders}
    />
    <SelectAsyncField
      name="templates"
      label={props.translate('Templates')}
      required={true}
      clearable={false}
      multi={true}
      labelKey="name"
      valueKey="url"
      loadOptions={props.loadTemplates}
    />
    <span dangerouslySetInnerHTML={{__html: MonitoringGuide}}/>
  </ActionDialog>
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadProviders: query =>
    actions.loadProviders({query}, dispatch),

  loadTemplates: query =>
    actions.loadTemplates({query}, dispatch),

  createHost: data =>
    actions.createHost({...data, resource: ownProps.resolve.resource}, dispatch),
});

const connector = connect(null, mapDispatchToProps);

const enhance = compose(
  connector,
  withTranslation,
  reduxForm({form: 'monitoringCreate'}),
);

const MonitoringCreateContainer = enhance(MonitoringCreateDialog);

export default connectAngularComponent(MonitoringCreateContainer, ['resolve']);
