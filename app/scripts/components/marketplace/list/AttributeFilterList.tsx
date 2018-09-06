import * as React from 'react';
import { reduxForm, Field } from 'redux-form';

import { AwesomeCheckBoxGroup } from '@waldur/form-react/AwesomeCheckboxGroup';
import { configAttrField } from '@waldur/marketplace/offerings/OfferingAttributes';
import { Section } from '@waldur/marketplace/types';

interface AttributeFilterListProps {
  sections: Section[];
}

interface AttributeFilterProps {
  section: Section;
}

const PureAttributeFilterList = props => (
  <form>
    {props.sections.map((section, index) => (
      <AttributeFilter key={index} section={section}/>
    ))}
  </form>
);

const renderSection = section => {
  if (!!section.attributes.length) {
    return section.attributes.some(attribute => !!attribute.options.length);
  }
};

const SUPPORTED_TYPES = ['choice', 'list', 'boolean'];

const renderAttribute = attribute => SUPPORTED_TYPES.indexOf(attribute.type) !== -1;

const AttributeFilter = (props: AttributeFilterProps) => {
  return renderSection(props.section) && (
    <section className="m-t-md">
      <h3 className="shopping-cart-sidebar-title">
        {props.section.title}
      </h3>
      {
        props.section.attributes.filter(renderAttribute).map((attribute, outerIndex) => {
          const attr = configAttrField(attribute);
          const attrKey = attribute.key;
          return (
            <span key={outerIndex}>
              <h4>{attribute.title}</h4>
              {
                attribute.type === 'list' ?
                  <AwesomeCheckBoxGroup
                    outerIndex={outerIndex}
                    fieldName={attribute.key}
                    options={attribute.options}
                  /> :
                <Field
                  key={outerIndex}
                  name={`${attribute.type}-${attrKey}-${outerIndex}`}
                  component="input"
                  className="form-control"
                  {...attr}
                />
              }
            </span>
          );
        })
      }
    </section>
  );
};

export const AttributeFilterList = reduxForm<any, AttributeFilterListProps>({
  form: 'marketplaceFilter',
})(PureAttributeFilterList);
