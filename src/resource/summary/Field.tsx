import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { Tip } from '@waldur/core/Tooltip';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import './Field.css';

interface FieldProps {
  label: string;
  helpText?: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  labelClass?: string;
  valueClass?: string;
  hasCopy?: boolean;
  isStuck?: boolean;
  labelCol?: number;
  valueCol?: number;
  space?: number;
}

export const Field: FunctionComponent<FieldProps> = (props) =>
  props.value || props.children ? (
    <Row
      className={classNames(
        'field-row g-0',
        `mb-${props.space ?? 1}`,
        props.className,
      )}
    >
      <Col
        sm={props.isStuck ? 'auto' : props.labelCol || 3}
        className={classNames(
          'field-label text-gray-700 fw-bold',
          props.labelClass,
        )}
      >
        {props.label.length > 20 ? (
          <Tip label={props.label} id="fieldLabel">
            {props.label}:
          </Tip>
        ) : (
          props.label + ':'
        )}
      </Col>
      <Col
        sm={props.isStuck ? undefined : props.valueCol || 9}
        className={classNames('text-gray-500', props.valueClass)}
      >
        {props.value || props.children || DASH_ESCAPE_CODE}
        {props.helpText && (
          <Tip label={props.helpText} id="fieldHelpText">
            {' '}
            <QuestionIcon size={17} />
          </Tip>
        )}
        {props.hasCopy && (
          <CopyToClipboardButton
            value={props.value}
            size={17}
            className="mx-2 text-hover-primary cursor-pointer d-inline z-index-1"
          />
        )}
      </Col>
    </Row>
  ) : null;
