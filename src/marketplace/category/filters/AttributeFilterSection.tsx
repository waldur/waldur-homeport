import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Field, getFormValues } from 'redux-form';

import { InputField } from '@waldur/form/InputField';
import { configAttrField } from '@waldur/marketplace/offerings/attributes/utils';
import { Section } from '@waldur/marketplace/types';

import { MARKETPLACE_FILTER_FORM } from '../store/constants';
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

export const PureAttributeFilterSection: FunctionComponent<PureAttributeFilterSectionProps> =
  (props) => (
    <section>
      <h3 className="text-gray-700 mb-6">{props.section.title}</h3>
      {props.section.attributes.map((attribute, outerIndex) => {
        const attrConfig = configAttrField(attribute);
        const attrKey = attribute.key;
        return (
          <AttributeFilterItem
            key={outerIndex}
            title={<h4 className="text-gray-800 my-4">{attribute.title}</h4>}
            selected={markSelectedFilter(
              props.filterValues,
              `${attribute.type}-${attrKey}-${outerIndex}`,
            )}
            counter={countSelectedFilterValues(props.filterValues, attrKey)}
          >
            {attribute.type === 'list' ? (
              <AwesomeCheckBoxGroup
                outerIndex={outerIndex}
                fieldName={attribute.key}
                options={attribute.options}
              />
            ) : (
              <Field
                key={outerIndex}
                name={`${attribute.type}-${attrKey}-${outerIndex}`}
                component={InputField}
                className="mb-2"
                {...attrConfig}
              />
            )}
          </AttributeFilterItem>
        );
      })}
    </section>
  );

const mapStateToProps = (state, props) => ({
  filterValues: getFormValues(MARKETPLACE_FILTER_FORM)(state),
  section: props.section,
});

export const AttributeFilterSection = connect(mapStateToProps)(
  PureAttributeFilterSection,
);
