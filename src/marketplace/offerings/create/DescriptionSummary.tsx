import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { AttributesTable } from '@waldur/marketplace/details/attributes/AttributesTable';

import { getCategory, getOfferingFormValues } from '../store/selectors';
import { formatAttributes } from '../store/utils';

import { hasError } from './utils';

const PureDescriptionSummary = (props) => (
  <>
    <h3>{translate('Description')}</h3>
    {props.categoryInvalid ? (
      <p>{translate('Category is invalid.')}</p>
    ) : props.attributesInvalid ? (
      <p>{translate('Attributes are invalid.')}</p>
    ) : (
      <>
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
    )}
  </>
);

const connector = connect((state) => {
  const categoryInvalid = hasError('category')(state);
  const attributesInvalid = hasError('attributes')(state);

  const formData: any = getOfferingFormValues(state);
  const category = getCategory(state);
  if (!category) {
    return {
      categoryInvalid: true,
      attributesInvalid: true,
    };
  }

  const attributes = formatAttributes(category, formData.attributes || {});
  const filterSection = (section) =>
    section.attributes.some((attr) => attributes.hasOwnProperty(attr.key));
  const sections = category.sections.filter(filterSection);

  return {
    sections,
    attributes,
    category,
    categoryInvalid,
    attributesInvalid,
  };
});

export const DescriptionSummary = connector(PureDescriptionSummary);
