import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { FunctionComponent, ReactNode, useMemo } from 'react';
import { Col, ColProps, Row } from 'react-bootstrap';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { Tip } from '@/core/Tooltip';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import './Field.css';

interface FieldProps {
  label: ReactNode;
  labelTooltipLen?: number | false;
  tooltip?: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  labelClass?: string;
  valueClass?: string;
  hasCopy?: boolean;
  isStuck?: boolean;
  labelCol?: number | 'auto';
  valueCol?: number | 'auto';
  labelWidth?: number;
  xs?: ColProps['xs'];
  space?: number;
}

export const Field: FunctionComponent<FieldProps> = ({
  labelTooltipLen = 20,
  space = 1,
  labelWidth,
  ...props
}) => {
  const labelStyle = useMemo(
    () =>
      labelWidth ? { width: labelWidth, minWidth: labelWidth } : undefined,
    [labelWidth],
  );
  return props.value || props.children ? (
    <Row
      className={classNames(
        'field-row g-0',
        space && `mb-${space}`,
        props.className,
      )}
    >
      <Col
        xs={props.xs}
        sm={props.isStuck || labelWidth ? 'auto' : props.labelCol || 3}
        style={labelStyle}
        className={classNames(
          'field-label text-gray-700 fw-bold',
          props.labelClass,
        )}
      >
        {typeof props.label === 'string' ? (
          labelTooltipLen && props.label.length > labelTooltipLen ? (
            <Tip label={props.label} id="fieldLabel">
              {props.label}:
            </Tip>
          ) : (
            props.label + ':'
          )
        ) : (
          props.label
        )}
      </Col>
      <Col
        xs={props.xs}
        sm={props.isStuck ? undefined : props.valueCol || 9}
        className={classNames('text-gray-500', props.valueClass)}
      >
        {props.value || props.children || DASH_ESCAPE_CODE}
        {props.tooltip && (
          <Tip label={props.tooltip} id="fieldHelpText">
            {' '}
            <QuestionIcon size={16} weight="bold" className="text-gray-400" />
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
};
