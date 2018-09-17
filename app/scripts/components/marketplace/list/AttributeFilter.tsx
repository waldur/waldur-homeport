import * as React from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckBoxGroup } from '@waldur/form-react/AwesomeCheckboxGroup';
import { configAttrField } from '@waldur/marketplace/offerings/OfferingAttributes';
import { Section } from '@waldur/marketplace/types';

interface AttributeFilterProps {
  section: Section;
}

export const AttributeFilter = (props: AttributeFilterProps) => (
  <section className="m-t-md">
    <h3 className="shopping-cart-sidebar-title">
      {props.section.title}
    </h3>
    {
      props.section.attributes.map((attribute, outerIndex) => {
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
