import * as React from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckBoxGroup } from '@waldur/form-react/AwesomeCheckboxGroup';
import { configAttrField } from '@waldur/marketplace/offerings/OfferingAttributes';
import { Section } from '@waldur/marketplace/types';

import { AttributeFilterItem } from './AttributeFilterItem';

interface AttributeFilterSectionProps {
  section: Section;
}

export const AttributeFilterSection = (props: AttributeFilterSectionProps) => (
  <section className="m-t-md m-b-md">
    <h3 className="shopping-cart-sidebar-title">
      {props.section.title}
    </h3>
    {
      props.section.attributes.map((attribute, outerIndex) => {
        const attrConfig = configAttrField(attribute);
        const attrKey = attribute.key;
        return  <AttributeFilterItem
                  key={outerIndex}
                  title={<h4 className="attribute__title">{attribute.title}</h4>}
                >
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
                      {...attrConfig}
                    />
                  }
                </AttributeFilterItem>;
      })
    }
  </section>
);
