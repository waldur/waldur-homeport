import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import {
  cloneElement,
  FC,
  isValidElement,
  PropsWithChildren,
  ReactNode,
} from 'react';
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
    tooltip = props.help,
    tooltipEnd = props.helpEnd,
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
    controlId,
    ...rest
  } = props;

  const isLegacyCloneElement = Boolean(input && isValidElement(children));

  const newProps = isLegacyCloneElement
    ? {
        input,
        ...rest,
        onBlur: (event) => {
          if (!props.noUpdateOnBlur && input) {
            input.onBlur(event);
          }
        },
        isInvalid: meta && meta.touched && (!!meta.error || !!meta.submitError),
        id: input?.name || id,
        'aria-label':
          props['aria-label'] ||
          (hideLabel && typeof label === 'string' ? label : undefined),
      }
    : null;

  const labelNode = !hideLabel && (label || tooltip) && (
    <Form.Label
      className={classNames({ required, 'me-auto': !isLegacyCloneElement })}
      htmlFor={input?.name || id}
    >
      {tooltip && !tooltipEnd && (
        <Tip
          id={'form-field-tooltip-' + (input ? input.name : id || 'field')}
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
          'position-relative': isLegacyCloneElement,
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
              id={'form-field-tooltip-' + (input ? input.name : id || 'field')}
              className={classNames('align-self-center ms-2', {
                'mb-2': !isLegacyCloneElement,
              })}
              label={tooltip}
              {...tooltipProps}
            >
              <QuestionIcon
                weight="bold"
                size={isLegacyCloneElement ? 20 : 16}
                className="text-muted"
              />
            </Tip>
          )}
        </div>
      ) : (
        labelNode
      )}
      {isLegacyCloneElement ? (
        cloneElement(children as any, newProps)
      ) : (
        <div>{children}</div>
      )}
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
