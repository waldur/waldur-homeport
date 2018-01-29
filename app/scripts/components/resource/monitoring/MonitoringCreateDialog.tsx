import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValues } from 'redux-form';

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
    {props.link && (
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
    )}
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
    actions.loadProviders({resource: ownProps.resolve.resource.url}, dispatch),

  loadTemplates: query => {
    const params: any = {};
    if (ownProps.link) {
      params.service = ownProps.link.settings;
    }
    if (query) {
      params.name = query;
    }
    return actions.loadTemplates(params, dispatch);
  },

  createHost: data =>
    actions.createHost({...data, resource: ownProps.resolve.resource}, dispatch),
});

const enhance = compose(
  withTranslation,
  reduxForm({form: 'monitoringCreate'}),
  formValues({link: 'service_project_link'}),
  connect(null, mapDispatchToProps),
);

const MonitoringCreateContainer = enhance(MonitoringCreateDialog);

export default connectAngularComponent(MonitoringCreateContainer, ['resolve']);
