import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { CodePreview } from '@waldur/core/CodePreview';
import { translate } from '@waldur/i18n';

import { TextField } from './TextField';
import { FormField } from './types';

interface MarkdownFieldProps extends FormField {
  maxLength?: number;
  placeholder?: string;
  rows?: number;
  style?;
  formatKeys?: Record<string, string>;
  hidePreview?: boolean;
  verticalLayout?: boolean;
  className?: string;
}

export const MarkdownField: FunctionComponent<MarkdownFieldProps> = (props) => {
  const { hidePreview, verticalLayout, formatKeys, ...rest } = props;
  return hidePreview ? (
    <TextField {...rest} />
  ) : (
    <Row className={props.className}>
      <Col md={12} lg={verticalLayout ? 12 : 8} className="d-flex flex-column">
        <div className="flex-grow-1">
          <TextField {...rest} />
        </div>
      </Col>
      <Col
        xs={verticalLayout ? 12 : 'auto'}
        className={!verticalLayout ? 'p-0' : undefined}
      >
        <div
          className={
            verticalLayout
              ? 'border-bottom border-gray-300 border-2 my-5'
              : 'border-end border-gray-300 border-2 mx-5'
          }
        ></div>
      </Col>
      <Col className="pb-20">
        <div className="form-label">{translate('Preview')}</div>
        <CodePreview template={props.input.value} context={formatKeys} />
      </Col>
    </Row>
  );
};
