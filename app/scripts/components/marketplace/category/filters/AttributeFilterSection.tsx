import * as React from 'react';
import { connect } from 'react-redux';
import { Field, getFormValues } from 'redux-form';

import { configAttrField } from '@waldur/marketplace/offerings/attributes/utils';
import { Section } from '@waldur/marketplace/types';

import { MARKETPLACE_FILTER_FORM} from '../store/constants';
import { countSelectedFilterValues } from '../utils';
import { AttributeFilterItem } from './AttributeFilterItem';
import { AwesomeCheckBoxGroup } from './AwesomeCheckboxGroup';

interface PureAttributeFilterSectionProps {
  section: Section;
  filterValues?: object;
}

const markSelectedFilter = (filterValues, fieldName) => {
  if (filterValues) {
    return !!filterValues[fieldName];
  }
};

export const PureAttributeFilterSection = (props: PureAttributeFilterSectionProps) => (
  <section className="m-t-md m-b-md">
    <h3 className="shopping-cart-sidebar-title">
      {props.section.title}
    </h3>
    {
      props.section.attributes.map((attribute, outerIndex) => {
        const attrConfig = configAttrField(attribute);
        const attrKey = attribute.key;
        return (
          <AttributeFilterItem
            key={outerIndex}
            title={<h4 className="attribute__title">{attribute.title}</h4>}
            selected={markSelectedFilter(props.filterValues, `${attribute.type}-${attrKey}-${outerIndex}`)}
            counter={countSelectedFilterValues(props.filterValues, attrKey)}>
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
          </AttributeFilterItem>
        );
      })
    }
  </section>
);

const mapStateToProps = (state, props) => ({
  filterValues: getFormValues(MARKETPLACE_FILTER_FORM)(state),
  section: props.section,
});

export const AttributeFilterSection = connect(mapStateToProps)(PureAttributeFilterSection);
