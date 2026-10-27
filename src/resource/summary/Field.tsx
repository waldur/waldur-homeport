import classNames from 'classnames';
import React, { FunctionComponent, ReactNode, useMemo } from 'react';
import { Col, ColProps, Row } from 'react-bootstrap';

import { SPACE_CLASSES, Space } from 'waldur-form';
import { HelpIcon, Tooltip } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';

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
  space?: Space;
}

// A row with nothing to show is left out; 0 is a value and is shown.
const hasContent = (content: ReactNode) =>
  content !== undefined &&
  content !== null &&
  content !== '' &&
  content !== false;

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
  const content = hasContent(props.value) ? props.value : props.children;
  return hasContent(content) ? (
    <Row
      className={classNames(
        'field-row g-0',
        space && SPACE_CLASSES[space],
        props.className,
      )}
    >
      <Col
        xs={props.xs}
        sm={props.isStuck || labelWidth ? 'auto' : props.labelCol || 3}
        style={labelStyle}
        className={classNames(
          'field-label text-secondary font-medium',
          props.labelClass,
        )}
      >
        {typeof props.label === 'string' ? (
          labelTooltipLen && props.label.length > labelTooltipLen ? (
            <Tooltip label={props.label}>
              <span>{props.label}:</span>
            </Tooltip>
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
        className={classNames('text-quaternary', props.valueClass)}
      >
        {content}
        {props.tooltip && <HelpIcon label={props.tooltip} className="ms-1" />}
        {props.hasCopy && (
          <CopyToClipboardButton
            value={props.value}
            size={17}
            className="mx-1.5 hover:text-brand cursor-pointer inline z-index-1"
          />
        )}
      </Col>
    </Row>
  ) : null;
};
