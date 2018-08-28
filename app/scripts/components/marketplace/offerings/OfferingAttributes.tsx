import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';

import './OfferingAttributes.scss';

// See also: https://github.com/erikras/redux-form/issues/1852
const parseIntField = value => parseInt(value, 10) || 0;
const formatIntField = value => value ? value.toString() : '';

interface AttrType {
  fieldName?: string;
  type?: string;
  min?: number;
  parse?: any;
  format?: any;
  component?: any;
}

const configAttrField = attribute => {
  let attr: AttrType = {};
  switch (attribute.type) {
    case 'integer':
      attr = {
        fieldName: attribute.key,
        type: 'number',
        min: 0,
        parse: parseIntField,
        format: formatIntField,
      };
      break;
    case 'choice':
      attr = {
        fieldName: attribute.key,
        component: componentProp => (
          <Select
            value={componentProp.input.value}
            onChange={value => componentProp.input.onChange(value)}
            options={attribute.options}
            valueKey="key"
            labelKey="title"
            simpleValue={true}
          />
        ),
      };
      break;
    case 'boolean':
      attr = {
        component: componentProp => attribute.options.map((option, index) => (
          <AwesomeCheckbox
            key={index}
            id={option.key}
            {...componentProp.input}
          />
        )),
      };
      attribute.options.map(o => attr.fieldName = o.key);
      break;
    default:
      attr = {
        fieldName: attribute.key,
        type: 'text',
      };
  }
  return attr;
};

export const OfferingAttributes = props =>
  props.category.sections.map((section, sectionIndex) => (
    <div key={sectionIndex}>
      <div className="form-group">
        <div className="col-sm-offset-3 col-sm-5">
          <p className="form-control-static">
            <strong>{section.title}</strong>
          </p>
        </div>
      </div>
      {section.attributes.map((attribute, attributeIndex) => {
        const attr = configAttrField(attribute);
        return (
          <div className="form-group" key={attributeIndex}>
            <label className="control-label col-sm-3">
              {attribute.title}
            </label>
            <div className="col-sm-5">
              <Field
                key={attributeIndex}
                name={`attributes.${attr.fieldName}`}
                component="input"
                className="form-control"
                {...attr}
              />
            </div>
          </div>
        );
      })}
    </div>
  ));
