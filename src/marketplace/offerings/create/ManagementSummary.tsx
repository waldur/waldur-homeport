import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { translate } from '@waldur/i18n';
import { getAttributes, getProviderType } from '@waldur/marketplace/common/registry';
import { AttributesTable } from '@waldur/marketplace/details/attributes/AttributesTable';
import { Section } from '@waldur/marketplace/types';
import { getSerializer } from '@waldur/providers/registry';

import { FORM_ID } from '../store/constants';
import { hasError } from './utils';

const PureManagementSummary = props => {
  if (props.typeInvalid || props.optionsInvalid || props.schedulesInvalid || props.settingsInvalid) {
    return (
      <>
        <h3>{translate('Management')}</h3>
        {props.typeInvalid && <p>{translate('Type is invalid.')}</p>}
        {props.optionsInvalid && <p>{translate('Options are invalid.')}</p>}
        {props.schedulesInvalid && <p>{translate('Schedules are invalid.')}</p>}
        {props.settingsInvalid && <p>{translate('Service settings are invalid.')}</p>}
      </>
    );
  }

  const type = props.formData.type;

  const section: Section = {
    title: translate('Management'),
    attributes: getAttributes(type.value),
  };

  const providerType = getProviderType(type.value);
  const serializer = getSerializer(providerType);
  const attributes = props.formData.service_settings && serializer(props.formData.service_settings);
  const schedules = props.formData.schedules;

  return (
    <>
      <h3>{translate('Management')}</h3>
      <p><strong>{translate('Type')}</strong>: {type.label}</p>
      {attributes && <AttributesTable attributes={attributes} sections={[section]}/>}
      {/* Full calendar component is rendered as collapsed if it is not visible */}
      {schedules && props.isVisible && <Calendar events={schedules}/>}
    </>
  );
};

const connector = connect(state => ({
  formData: getFormValues(FORM_ID)(state),
  typeInvalid: hasError('type')(state),
  optionsInvalid: hasError('options')(state),
  settingsInvalid: hasError('service_settings')(state),
  schedulesInvalid: hasError('schedules')(state),
}));

export const ManagementSummary = connector(PureManagementSummary);
