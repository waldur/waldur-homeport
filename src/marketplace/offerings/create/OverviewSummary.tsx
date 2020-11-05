import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { AttributesTable } from '@waldur/marketplace/details/attributes/AttributesTable';
import { Section } from '@waldur/marketplace/types';

import { getOfferingFormValues } from '../store/selectors';

import { hasError } from './utils';

const PureOverviewSummary = (props) => {
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
        type: 'html',
      },
      {
        key: 'full_description',
        title: translate('Full description'),
        type: 'html',
      },
      {
        key: 'terms_of_service',
        title: translate('Terms of Service'),
        type: 'string',
      },
    ],
  };

  return (
    <>
      <h3>{translate('Overview')}</h3>
      {props.nameInvalid ? (
        <p>{translate('Name is not valid.')}</p>
      ) : props.formData ? (
        <AttributesTable attributes={props.formData} sections={[schema]} />
      ) : null}
    </>
  );
};

const connector = connect((state) => ({
  formData: getOfferingFormValues(state),
  nameInvalid: hasError('name')(state),
}));

export const OverviewSummary = connector(PureOverviewSummary);
