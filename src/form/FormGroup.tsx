import classNames from 'classnames';
import { uniqueId } from 'lodash-es';
import { FC, PropsWithChildren, ReactNode, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { FieldMetaState } from 'react-final-form';

import { HelpIcon, TooltipProps } from 'waldur-ui';

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
  tooltipProps?: Partial<TooltipProps>;

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

  // The help icon is a button, so it sits beside the <label>, not inside it:
  // inside, it would be one of the control's labels and be announced as part
  // of its name.
  const labelNode = !hideLabel && (label || tooltip) && (
    <>
      {tooltip && !tooltipEnd && (
        <>
          <HelpIcon
            label={tooltip}
            size={20}
            tooltipProps={tooltipProps}
          />{' '}
        </>
      )}
      {label && (
        <Form.Label className={classNames({ required, 'me-auto': true })}>
          {label}
        </Form.Label>
      )}
    </>
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
            <HelpIcon
              label={tooltip}
              className="ms-2 mb-2 h-5 items-center"
              tooltipProps={tooltipProps}
            />
          )}
        </div>
      ) : (
        labelNode
      )}
      <div>{children}</div>
      {description && <Form.Text>{description}</Form.Text>}
      {!hideError && meta && meta.touched && (
        // A refusal from the server applies to the value it was given; once
        // the field is edited it is stale until the next submit.
        <FieldError
          error={meta.error || (!meta.dirtySinceLastSubmit && meta.submitError)}
        />
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
