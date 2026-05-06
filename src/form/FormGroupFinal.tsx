import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import {
  cloneElement,
  FC,
  PropsWithChildren,
  ReactNode,
  useContext,
} from 'react';
import { Form } from 'react-bootstrap';
import { FieldRenderProps } from 'react-final-form';

import { Tip, TipProps } from '@/core/Tooltip';

import { FormFieldsContext } from './context';
import { FieldError } from './FieldError';

interface FormGroupProps extends Partial<FieldRenderProps<any, any>> {
  required?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  tooltip?: ReactNode;
  tooltipEnd?: boolean;
  tooltipProps?: Partial<TipProps>;
  hideLabel?: boolean;
  hideError?: boolean;
  actions?: ReactNode;
  quickAction?: ReactNode;
  containerClassName?: string;
  spaceless?: boolean;
  space?: number;
  noUpdateOnBlur?: boolean;
}

export const FormGroupFinal: FC<PropsWithChildren<FormGroupProps>> = (
  props,
) => {
  const context = useContext(FormFieldsContext);

  const {
    input,
    required,
    label,
    description,
    tooltip,
    tooltipEnd,
    tooltipProps,
    hideLabel,
    hideError,
    meta,
    children,
    actions,
    quickAction,
    spaceless,
    containerClassName,
    space = 7,
    ...rest
  } = props;

  const newProps = {
    input,
    ...rest,
    readOnly:
      (input && context.readOnlyFields.includes(input.name)) || rest.readOnly,
    onBlur: (event) => {
      if (!props.noUpdateOnBlur && input) {
        input.onBlur(event);
      }
    },
    isInvalid: meta && meta.touched && (!!meta.error || !!meta.submitError),
    id: input?.name,
  };

  const labelNode = !hideLabel && (
    <Form.Label className={classNames({ required })} htmlFor={input?.name}>
      {tooltip && !tooltipEnd && (
        <Tip
          id={'form-field-tooltip-' + (input ? input.name : 'field')}
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
    <div
      className={classNames(
        {
          'flex-grow-1': Boolean(actions),
        },
        'position-relative',
        !actions && containerClassName,
        !spaceless && `mb-${space}`,
      )}
    >
      {quickAction || (tooltip && tooltipEnd) ? (
        <div className="d-flex align-items-end">
          <span className="me-auto">{labelNode}</span>
          {props.quickAction}
          {tooltip && tooltipEnd && (
            <Tip
              id={'form-field-tooltip-' + (input ? input.name : 'field')}
              className="align-self-center ms-2"
              label={tooltip}
              {...tooltipProps}
            >
              <QuestionIcon weight="bold" size={20} className="text-muted" />
            </Tip>
          )}
        </div>
      ) : (
        labelNode
      )}
      {cloneElement(children as any, newProps)}
      {description && <Form.Text>{description}</Form.Text>}
      {!hideError && meta && meta.touched && (
        <FieldError error={meta.error || meta.submitError} />
      )}
    </div>
  );

  if (actions) {
    return (
      <div
        className={classNames(
          'd-flex align-items-start gap-4',
          containerClassName,
        )}
      >
        {mainContent}
        {actions}
      </div>
    );
  }
  return mainContent;
};
