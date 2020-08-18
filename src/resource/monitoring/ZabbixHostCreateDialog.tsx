import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValues } from 'redux-form';

import { SelectAsyncField } from '@waldur/form';
import { withTranslation } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';

import * as actions from './actions';
import { MonitoringGuide } from './MonitoringGuide';
import { ZabbixTemplateRequest } from './types';

const PureZabbixHostCreateDialog = (props) => (
  <ActionDialog
    title={props.translate('Create Zabbix host')}
    submitLabel={props.translate('Create Zabbix host')}
    onSubmit={props.handleSubmit(props.createHost)}
    submitting={props.submitting}
    error={props.error}
  >
    <SelectAsyncField
      name="service_project_link"
      label={props.translate('Zabbix provider')}
      required={true}
      isClearable={false}
      getOptionValue={(option) => option.url}
      getOptionLabel={(option) => option.service_name}
      defaultOptions
      loadOptions={props.loadLinks}
    />
    {props.link && (
      <SelectAsyncField
        name="templates"
        label={props.translate('Templates')}
        required={true}
        isClearable={false}
        isMulti={true}
        getOptionValue={(option) => option.url}
        getOptionLabel={(option) => option.name}
        defaultOptions
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
  loadLinks: () =>
    actions.loadLinks({ resource: ownProps.resolve.resource.url }, dispatch),

  loadTemplates: (query) => {
    const request: ZabbixTemplateRequest = {
      settings_uuid: ownProps.link.service_settings_uuid,
    };
    if (query) {
      request.name = query;
    }
    return actions.loadTemplates(request, dispatch);
  },

  createHost: (data) =>
    actions.createHost(
      { ...data, resource: ownProps.resolve.resource },
      dispatch,
    ),
});

const enhance = compose(
  reduxForm({ form: 'monitoringCreate' }),
  formValues({ link: 'service_project_link' }),
  connect(null, mapDispatchToProps),
  withTranslation,
);

export const ZabbixHostCreateDialog = enhance(PureZabbixHostCreateDialog);
