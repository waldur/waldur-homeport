import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { AttributesTable } from '@waldur/marketplace/details/attributes/AttributesTable';

import { FORM_ID } from '../store/constants';
import { getCategory } from '../store/selectors';
import { formatAttributes } from '../store/utils';

const PureDescriptionSummary = props => props.category ? (
  <>
    <h3>{translate('Description')}</h3>
    <p>
      <strong>{translate('Category')}</strong>: {props.category.title}
    </p>
    {props.attributes && (
      <AttributesTable
        attributes={props.attributes}
        sections={props.sections}
      />
    )}
  </>
) : null;

const connector = connect(state => {
  const formData: any = getFormValues(FORM_ID)(state);
  const category = getCategory(state);
  if (!category) {
    return {};
  }

  const attributes = formatAttributes(category, formData.attributes || {});
  const filterSection = section => section.attributes.some(attr => attributes.hasOwnProperty(attr.key));
  const sections = category.sections.filter(filterSection);

  return {
    sections,
    attributes,
    category,
  };
});

export const DescriptionSummary = connector(PureDescriptionSummary);
