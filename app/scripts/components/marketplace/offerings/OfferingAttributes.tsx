import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { CustomRadioButton } from '@waldur/marketplace/offerings/CustomRadioButton';

import './OfferingAttributes.scss';

// See also: https://github.com/erikras/redux-form/issues/1852
const parseIntField = value => parseInt(value, 10) || 0;
const formatIntField = value => value ? value.toString() : '';

interface AttrType {
  type?: string;
  min?: number;
  parse?: any;
  format?: any;
  component?: any;
  normalize?: (v: string) => string;
  checked?: boolean;
}

export const configAttrField = attribute => {
  let attr: AttrType = {};
  switch (attribute.type) {
    case 'integer':
      attr = {
        type: 'number',
        min: 0,
        parse: parseIntField,
        format: formatIntField,
      };
      break;
    case 'list':
      attr = {
        component: componentProp => (
          <Select
            value={componentProp.input.value}
            onChange={value => componentProp.input.onChange(value)}
            options={attribute.options}
            valueKey="key"
            labelKey="title"
            multi={true}
          />
        ),
        normalize: v => v ? v : '',
      };
      break;
    case 'choice':
      attr = {
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
        normalize: v => v ? v : '',
      };
      break;
    case 'boolean':
      attr = {
        component: componentProp => {
          const choices = [
            {value: '', label: 'All'},
            {value: 'true', label: 'Yes'},
            {value: 'false', label: 'No'},
          ];
          return (
            <CustomRadioButton
              choices={choices}
              name={attribute.key}
              input={componentProp.input}/>
          );
        },
      };
      break;
    default:
      attr = {
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
                name={`attributes.${attribute.key}`}
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
