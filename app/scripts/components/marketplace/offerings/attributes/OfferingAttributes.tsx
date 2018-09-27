import * as React from 'react';
import { Field } from 'redux-form';

import './OfferingAttributes.scss';
import { configAttrField } from './utils';

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
