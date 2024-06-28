import { Question } from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { Tip } from '@waldur/core/Tooltip';

interface FieldProps {
  label: string;
  helpText?: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  valueClass?: string;
  hasCopy?: boolean;
  isStuck?: boolean;
}

export const Field: FunctionComponent<FieldProps> = (props) =>
  props.value || props.children ? (
    <Row className={classNames('mb-1', props.className)}>
      <Col sm={props.isStuck ? 'auto' : 3} className="text-dark fw-bolder">
        {props.label.length > 20 ? (
          <Tip label={props.label} id="fieldLabel">
            {props.label}:
          </Tip>
        ) : (
          props.label + ':'
        )}
      </Col>
      <Col
        sm={props.isStuck ? undefined : 9}
        className={classNames('text-dark', props.valueClass)}
      >
        {props.value || props.children}
        {props.helpText && (
          <Tip label={props.helpText} id="fieldHelpText">
            {' '}
            <Question />
          </Tip>
        )}
        {props.hasCopy && (
          <CopyToClipboardButton
            value={props.value}
            size={15}
            className="mx-2 text-hover-primary cursor-pointer d-inline z-index-1"
          />
        )}
      </Col>
    </Row>
  ) : null;
