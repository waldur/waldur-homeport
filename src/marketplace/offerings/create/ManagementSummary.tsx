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

const PureManagementSummary = props => {
  if (!props.formData) {
    return null;
  }

  const type = props.formData.type;
  if (!type) {
    return null;
  }

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
      {schedules && <Calendar events={schedules}/>}
    </>
  );
};

const connector = connect(state => ({
  formData: getFormValues(FORM_ID)(state),
}));

export const ManagementSummary = connector(PureManagementSummary);
