import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { AttributesTable } from '@waldur/marketplace/details/attributes/AttributesTable';
import { Section } from '@waldur/marketplace/types';

import { FORM_ID } from '../store/constants';

const PureOverviewSummary = props => {
  const schema: Section = {
    title: translate('Overview'),
    attributes: [
      {
        key: 'name',
        title: translate('Name'),
        type: 'string',
      },
      {
        key: 'description',
        title: translate('Description'),
        type: 'string',
      },
      {
        key: 'full_description',
        title: translate('Full description'),
        type: 'html',
      },
      {
        key: 'native_name',
        title: translate('Native name'),
        type: 'string',
      },
      {
        key: 'native_description',
        title: translate('Native description'),
        type: 'string',
      },
      {
        key: 'terms_of_service',
        title: translate('Terms of Service'),
        type: 'string',
      },
    ],
  };

  if (!props.formData) {
    return <p className="text-center">{translate('Offering is not configured yet.')}</p>;
  }

  return (
    <>
      <h3>{translate('Overview')}</h3>
      <AttributesTable
        attributes={props.formData}
        sections={[schema]}
      />
    </>
  );
};

const connector = connect(state => ({
  formData: getFormValues(FORM_ID)(state),
}));

export const OverviewSummary = connector(PureOverviewSummary);
