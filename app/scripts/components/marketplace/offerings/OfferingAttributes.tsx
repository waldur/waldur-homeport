import * as React from 'react';
import { Field } from 'redux-form';

const parseIntField = value => value === undefined ? undefined : parseInt(value, 10);

export const OfferingAttributes = props =>
  props.category.sections.map((section, sectionIndex) => (
    <div key={sectionIndex}>
        {section.attributes.map((attribute, attributeIndex) => {
          let attrs = {};
          if (attribute.type === 'integer') {
            attrs = {
              type: 'number',
              min: 0,
              parse: parseIntField,
            };
          } else {
            attrs = {
              type: 'text',
            };
          }
          return (
            <div className="form-group" key={attributeIndex}>
              <label className="control-label">
                {attribute.title}
              </label>
              <Field
                key={attributeIndex}
                name={attribute.key}
                component="input"
                className="form-control"
                {...attrs}
              />
            </div>
          );
        })}
    </div>
  ));
