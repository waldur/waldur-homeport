import * as React from 'react';
import { Field, reduxForm } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { Section } from '@waldur/marketplace/types';

interface FeatureFilterListProps {
  sections: Section[];
}

interface FeatureFilterProps {
  section: Section;
}

const PureFeatureFilterList = props => (
  <form>
    {props.sections.map((section, index) => (
      <FeatureFilter key={index} section={section}/>
    ))}
  </form>
);

const FeatureFilter = (props: FeatureFilterProps) => (
  <section className="m-t-md">
    <h3 className="shopping-cart-sidebar-title">
      {props.section.title}
    </h3>

    {props.section.features.map((feature, index) => (
      <Field
        key={index}
        name={`filter-item-${feature.key}`}
        component={prop =>
          <AwesomeCheckbox
            id={`filter-item-${feature.key}`}
            label={feature.title}
            {...prop.input}
          />
        }
      />
    ))}
  </section>
);

export const FeatureFilterList = reduxForm<any, FeatureFilterListProps>({
  form: 'marketplaceFilter',
})(PureFeatureFilterList);
