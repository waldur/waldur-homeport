import * as React from 'react';
import { Field, reduxForm } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
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

const AttributeFilter = (props: AttributeFilterProps) => (
  renderSection(props.section) &&
  (
    <section className="m-t-md">
      <h3 className="shopping-cart-sidebar-title">
        {props.section.title}
      </h3>
      {props.section.attributes.map((attribute, outerIndex) => (
        (!!attribute.options.length && attribute.type === 'list' &&
          <span key={outerIndex}>
            <h4>{attribute.title}</h4>
            {attribute.options.map((option, index) => (
              <div key={index} className="m-l-sm">
                <Field
                  key={index}
                  name={`${attribute.key}-${index}`}
                  component={prop =>
                    <AwesomeCheckbox
                      id={`filter-item-${option.key}-${outerIndex}`}
                      label={option.title}
                      {...prop.input}
                    />
                  }
                  normalize={v => v ? option.key : ''}
                />
              </div>)
            )}
          </span>)
      ))}
    </section>
  )
);

export const AttributeFilterList = reduxForm<any, AttributeFilterListProps>({
  form: 'marketplaceFilter',
})(PureAttributeFilterList);
