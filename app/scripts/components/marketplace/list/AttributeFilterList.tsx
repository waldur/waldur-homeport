import * as React from 'react';
import { reduxForm } from 'redux-form';

import { Section } from '@waldur/marketplace/types';

import { AttributeFilter } from './AttributeFilter';

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
      <AttributeFilter key={index} section={section}/>
    ))}
  </form>
);

export const AttributeFilterList = reduxForm<any, AttributeFilterListProps>({
  form: 'marketplaceFilter',
})(PureAttributeFilterList);
