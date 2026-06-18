import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { uniqueId } from 'lodash-es';
import { FC, PropsWithChildren, ReactNode, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { FieldMetaState } from 'react-final-form';

import { Tip, TipProps } from '@/core/Tooltip';

import { FieldError } from './FieldError';

export interface FormGroupProps {
  label?: ReactNode;
  required?: boolean;
  description?: ReactNode;

  // Tooltip / Help aliases
  tooltip?: ReactNode;
  help?: ReactNode;
  tooltipEnd?: boolean;
  helpEnd?: boolean;
  tooltipProps?: Partial<TipProps>;

  hideLabel?: boolean;
  hideError?: boolean;
  actions?: ReactNode;
  quickAction?: ReactNode;

  // Styling
  className?: string;
  containerClassName?: string;
  spaceless?: boolean;
  space?: number;

  // React Final Form
  input?: any;
  meta?: Partial<FieldMetaState<any>> & { submitError?: any };
  noUpdateOnBlur?: boolean;
  forceTouched?: boolean;

  id?: string;
  controlId?: string;
}

export const FormGroup: FC<PropsWithChildren<FormGroupProps>> = (props) => {
  const {
    input,
    required,
    label,
    description,
    tooltip: propsTooltip,
    help,
    tooltipEnd: propsTooltipEnd,
    helpEnd,
    tooltipProps,
    hideLabel,
    hideError,
    meta,
    children,
    actions,
    quickAction,
    spaceless,
    containerClassName,
    className,
    space = 7,
    id,
    controlId: propsControlId,
  } = props;

  const tooltip = propsTooltip || help;
  const tooltipEnd = propsTooltipEnd || helpEnd;

  const controlId = useMemo(
    () => propsControlId || id || input?.name || uniqueId('form-group-'),
    [propsControlId, id, input?.name],
  );

  const labelNode = !hideLabel && (label || tooltip) && (
    <Form.Label className={classNames({ required, 'me-auto': true })}>
      {tooltip && !tooltipEnd && (
        <Tip
          id={'form-field-tooltip-' + controlId}
          label={tooltip}
          {...tooltipProps}
        >
          <QuestionIcon weight="bold" size={20} className="text-muted" />{' '}
        </Tip>
      )}
      {label}
    </Form.Label>
  );

  const mainContent = (
    <Form.Group
      className={classNames(
        {
          'flex-grow-1': Boolean(actions),
        },
        !actions && (containerClassName || className),
        !spaceless && `mb-${space}`,
      )}
      controlId={controlId}
    >
      {quickAction || (tooltip && tooltipEnd) ? (
        <div className="d-flex align-items-end">
          {labelNode && <span className="me-auto">{labelNode}</span>}
          {quickAction}
          {tooltip && tooltipEnd && (
            <Tip
              id={'form-field-tooltip-' + controlId}
              className="align-self-center ms-2 mb-2"
              label={tooltip}
              {...tooltipProps}
            >
              <QuestionIcon weight="bold" size={16} className="text-muted" />
            </Tip>
          )}
        </div>
      ) : (
        labelNode
      )}
      <div>{children}</div>
      {description && <Form.Text>{description}</Form.Text>}
      {!hideError && meta && meta.touched && (
        <FieldError error={meta.error || meta.submitError} />
      )}
    </Form.Group>
  );

  if (actions) {
    return (
      <div
        className={classNames(
          'd-flex align-items-start gap-4',
          containerClassName || className,
        )}
      >
        {mainContent}
        {actions}
      </div>
    );
  }
  return mainContent;
};
