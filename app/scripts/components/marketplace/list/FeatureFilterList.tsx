import * as React from 'react';
import { Field, reduxForm } from 'redux-form';

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
      <div className="checkbox awesome-checkbox checkbox-success" key={index}>
        <Field
          component="input"
          type="checkbox"
          id={`filter-item-${feature.key}`}
          name={`filter-item-${feature.key}`}
        />
        <label htmlFor={`filter-item-${feature.key}`}>
          {feature.title}
        </label>
      </div>
    ))}
  </section>
);

export const FeatureFilterList = reduxForm<any, FeatureFilterListProps>({
  form: 'marketplaceFilter',
})(PureFeatureFilterList);
