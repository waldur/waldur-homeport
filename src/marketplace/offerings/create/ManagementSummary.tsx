import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { translate } from '@waldur/i18n';
import {
  getAttributes,
  getProviderType,
} from '@waldur/marketplace/common/registry';
import { AttributesTable } from '@waldur/marketplace/details/attributes/AttributesTable';
import { Section } from '@waldur/marketplace/types';
import { getSerializer } from '@waldur/providers/registry';

import { FORM_ID } from '../store/constants';

import { hasError } from './utils';

const PureManagementSummary = props => {
  const type = props.formData?.type;

  if (!type || props.tabHasError) {
    return (
      <>
        <h3>{translate('Management')}</h3>
        {props.typeInvalid && <p>{translate('Type is invalid.')}</p>}
        {props.optionsInvalid && <p>{translate('Options are invalid.')}</p>}
        {props.schedulesInvalid && <p>{translate('Schedules are invalid.')}</p>}
        {props.settingsInvalid && (
          <p>{translate('Service settings are invalid.')}</p>
        )}
        {props.pluginOptionsInvalid && (
          <p>{translate('Plugin options are invalid.')}</p>
        )}
      </>
    );
  }

  const section: Section = {
    title: translate('Management'),
    attributes: getAttributes(type.value),
  };

  const providerType = getProviderType(type.value);
  const serializer = getSerializer(providerType);
  const attributes =
    props.formData.service_settings &&
    serializer(props.formData.service_settings);
  const schedules = props.formData.schedules;

  return (
    <>
      <h3>{translate('Management')}</h3>
      <p>
        <strong>{translate('Type')}</strong>: {type.label}
      </p>
      {attributes && (
        <AttributesTable attributes={attributes} sections={[section]} />
      )}
      {/* Full calendar component is rendered as collapsed if it is not visible */}
      {schedules && props.isVisible && <Calendar events={schedules} />}
    </>
  );
};

const connector = connect(state => {
  const formData = getFormValues(FORM_ID)(state);
  const typeInvalid = hasError('type')(state);
  const optionsInvalid = hasError('options')(state);
  const settingsInvalid = hasError('service_settings')(state);
  const schedulesInvalid = hasError('schedules')(state);
  const pluginOptionsInvalid = hasError('pluginOptions')(state);
  const tabHasError =
    typeInvalid ||
    optionsInvalid ||
    schedulesInvalid ||
    settingsInvalid ||
    pluginOptionsInvalid;
  return {
    formData,
    typeInvalid,
    optionsInvalid,
    settingsInvalid,
    schedulesInvalid,
    pluginOptionsInvalid,
    tabHasError,
  };
});

export const ManagementSummary = connector(PureManagementSummary);
