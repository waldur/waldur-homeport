import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValueSelector } from 'redux-form';

import { SelectAsyncField } from '@waldur/form-react';
import { withTranslation } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import * as actions from './actions';
import { MonitoringGuide } from './MonitoringGuide';

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
    {props.link && (
      <MonitoringGuide
        translate={props.translate}
        resource={props.resolve.resource}
        link={props.link}
      />
    )}
  </ActionDialog>
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadProviders: () =>
    actions.loadProviders({project_uuid: ownProps.resolve.resource.project_uuid}, dispatch),

  loadTemplates: query =>
    actions.loadTemplates(query, dispatch),

  createHost: data =>
    actions.createHost({...data, resource: ownProps.resolve.resource}, dispatch),
});

const mapStateToProps = state => ({
  link: formValueSelector('monitoringCreate')(state, 'service_project_link'),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  withTranslation,
  reduxForm({form: 'monitoringCreate'}),
);

const MonitoringCreateContainer = enhance(MonitoringCreateDialog);

export default connectAngularComponent(MonitoringCreateContainer, ['resolve']);
