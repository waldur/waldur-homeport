import React from 'react';
import { Col, Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { FieldError } from '@waldur/form';
import { Section } from '@waldur/marketplace/types';

import { configAttrField } from './utils';

interface OfferingAttributesProps {
  sections: Section[];
  labelCols?: number;
  controlCols?: number;
}

export const OfferingAttributes: React.FC<OfferingAttributesProps> = (
  props,
) => (
  <>
    {props.sections.map((section, sectionIndex) => (
      <div key={sectionIndex}>
        <Form.Group>
          <Col sm={{ span: props.controlCols, offset: props.labelCols }}>
            <Form.Control plaintext>
              <strong>{section.title}</strong>
            </Form.Control>
          </Col>
        </Form.Group>
        {section.attributes.map((attribute, attributeIndex) => {
          if (attribute.type === 'boolean') {
            return (
              <Form.Group key={attributeIndex}>
                <Col sm={{ span: props.controlCols, offset: props.labelCols }}>
                  <Field
                    name={`attributes.${attribute.key}`}
                    component={(prop) => (
                      <AwesomeCheckbox
                        label={attribute.title}
                        {...prop.input}
                      />
                    )}
                  />
                </Col>
              </Form.Group>
            );
          }
          const attr = configAttrField(attribute);
          return (
            <Form.Group key={attributeIndex}>
              <Col sm={props.labelCols} as={Form.Label}>
                {attribute.title}
              </Col>
              <Col sm={props.controlCols}>
                <Field
                  key={attributeIndex}
                  name={`attributes.${attribute.key}`}
                  component={Form.Control}
                  {...attr}
                />
                <Field
                  name={`attributes.${attribute.key}`}
                  {...attr}
                  component={(fieldProps) => (
                    <FieldError error={fieldProps.meta.error} />
                  )}
                />
              </Col>
            </Form.Group>
          );
        })}
      </div>
    ))}
  </>
);

OfferingAttributes.defaultProps = {
  labelCols: 3,
  controlCols: 5,
};
