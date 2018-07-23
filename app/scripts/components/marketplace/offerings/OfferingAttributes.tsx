import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

// See also: https://github.com/erikras/redux-form/issues/1852
const parseIntField = value => parseInt(value, 10) || 0;
const formatIntField = value => value ? value.toString() : '';

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
        let attrs = {};
        if (attribute.type === 'integer') {
          attrs = {
            type: 'number',
            min: 0,
            parse: parseIntField,
            format: formatIntField,
          };
        } else if (attribute.type === 'choice') {
          attrs = {
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
        } else {
          attrs = {
            type: 'text',
          };
        }
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
                {...attrs}
              />
            </div>
          </div>
        );
      })}
    </div>
  ));
