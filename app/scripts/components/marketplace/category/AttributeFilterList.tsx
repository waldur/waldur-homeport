import * as React from 'react';
import { reduxForm } from 'redux-form';

import { Section } from '@waldur/marketplace/types';

import './AttributeFilterList.scss';
import { AttributeFilterSection } from './AttributeFilterSection';
import { MARKETPLACE_FILTER_FORM } from './store/constants';

interface AttributeFilterListProps {
  sections: Section[];
}

const SUPPORTED_TYPES = ['choice', 'list', 'boolean'];

const prepareSections = sections =>
  sections.map(section => ({
    ...section,
    attributes: section.attributes.filter(attribute => SUPPORTED_TYPES.indexOf(attribute.type) !== -1),
  })).filter(section => section.attributes.length > 0);

const PureAttributeFilterList = props => (
  <form>
    {prepareSections(props.sections).map((section, index) => (
      <AttributeFilterSection key={index} section={section} />
    ))}
  </form>
);

export const AttributeFilterList = reduxForm<any, AttributeFilterListProps>({
  form: MARKETPLACE_FILTER_FORM,
  destroyOnUnmount: false,
})(PureAttributeFilterList);
