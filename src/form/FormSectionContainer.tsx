import React from 'react';
import { Col, Row } from 'react-bootstrap';

import { FormContainer, FormContainerProps } from './FormContainer';

export interface FormSectionContainerProps extends FormContainerProps {
  label: React.ReactNode;
}

export const FormSectionContainer: React.FC<FormSectionContainerProps> = (
  props,
) => {
  const { label, className = 'size-sm mx-0', ...rest } = props;

  return (
    <Row>
      <Col sm={3}>
        {typeof label === 'string' ? <h6 className="my-5">{label}</h6> : label}
      </Col>
      <Col sm={9}>
        <FormContainer className={className} {...rest}>
          {props.children}
        </FormContainer>
      </Col>
    </Row>
  );
};
