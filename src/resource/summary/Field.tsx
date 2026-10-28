import classNames from 'classnames';
import React, { FunctionComponent, ReactNode, useMemo } from 'react';

import { SPACE_CLASSES, Space } from 'waldur-form';
import { HelpIcon, Tooltip } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';

import './Field.css';

// Column width from `sm` up, out of 12; below `sm` both cells take the full width.
type ColWidth = number | 'auto';

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
  labelCol?: ColWidth;
  valueCol?: ColWidth;
  labelWidth?: number;
  /** Auto-width cells below `sm` too, instead of full-width ones. */
  xs?: 'auto';
  space?: Space;
}

// A row with nothing to show is left out; 0 is a value and is shown.
const hasContent = (content: ReactNode) =>
  content !== undefined &&
  content !== null &&
  content !== '' &&
  content !== false;

// Literal class names so Tailwind generates them.
const SM_WIDTH: Record<number, string> = {
  1: 'sm:w-1/12',
  2: 'sm:w-2/12',
  3: 'sm:w-3/12',
  4: 'sm:w-4/12',
  5: 'sm:w-5/12',
  6: 'sm:w-6/12',
  7: 'sm:w-7/12',
  8: 'sm:w-8/12',
  9: 'sm:w-9/12',
  10: 'sm:w-10/12',
  11: 'sm:w-11/12',
  12: 'sm:w-full',
};

const cellClassName = (width?: ColWidth, xs?: 'auto') =>
  // No width at all: shares the row beside the label at every size.
  !width && !xs
    ? 'flex-1 max-w-full'
    : classNames(
        xs === 'auto' ? 'w-auto flex-none' : 'w-full shrink-0',
        'max-w-full',
        width === 'auto' ? 'sm:w-auto sm:flex-none' : width && SM_WIDTH[width],
      );

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
    <div
      className={classNames(
        'field-row flex flex-wrap',
        space && SPACE_CLASSES[space],
        props.className,
      )}
    >
      <div
        style={labelStyle}
        className={classNames(
          cellClassName(
            props.isStuck || labelWidth ? 'auto' : props.labelCol || 3,
            props.xs,
          ),
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
      </div>
      <div
        className={classNames(
          cellClassName(
            props.isStuck ? undefined : props.valueCol || 9,
            props.xs,
          ),
          'text-quaternary break-words',
          props.valueClass,
        )}
      >
        {content}
        {props.tooltip && <HelpIcon label={props.tooltip} className="ms-1" />}
        {props.hasCopy && (
          <CopyToClipboardButton
            value={props.value}
            size={17}
            className="mx-1.5 hover:text-brand cursor-pointer inline z-1"
          />
        )}
      </div>
    </div>
  ) : null;
};
