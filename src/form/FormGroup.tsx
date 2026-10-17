import classNames from 'classnames';
import { uniqueId } from 'lodash-es';
import {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
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

/**
 * Ids of what a FormGroup renders around its control — label, description,
 * error — for controls that wire ARIA themselves (`aria-labelledby`,
 * `aria-describedby`, `aria-invalid`), e.g. the date pickers. Each id is
 * set only while that element is on screen.
 */
interface FormGroupA11y {
  labelId?: string;
  descriptionId?: string;
  errorId?: string;
  /**
   * For a control that reports its own error (a date picker refusing a
   * typed entry): while set, the group holds back the form's error, which
   * would only restate it — refusing the entry empties the value, so a
   * `required` check fails too.
   */
  setControlError?(hasError: boolean): void;
}

const FormGroupA11yContext = createContext<FormGroupA11y>({});

export const useFormGroupA11y = () => useContext(FormGroupA11yContext);

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
  const shownError =
    !hideError &&
    meta &&
    meta.touched &&
    // A refusal from the server applies to the value it was given; once
    // the field is edited it is stale until the next submit.
    (meta.error || (!meta.dirtySinceLastSubmit && meta.submitError));
  const hasLabel = !hideLabel && !!label;
  const hasDescription = !!description;
  const [controlError, setControlError] = useState(false);
  const hasError = !!shownError && !controlError;
  const a11y = useMemo<FormGroupA11y>(
    () => ({
      labelId: hasLabel ? `${controlId}-label` : undefined,
      descriptionId: hasDescription ? `${controlId}-description` : undefined,
      errorId: hasError ? `${controlId}-error` : undefined,
      setControlError,
    }),
    [controlId, hasLabel, hasDescription, hasError],
  );

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
        <Form.Label
          id={a11y.labelId}
          className={classNames({ required, 'me-auto': true })}
        >
          {label}
        </Form.Label>
      )}
    </>
  );

  const mainContent = (
    <Form.Group
      className={classNames(
        {
          grow: Boolean(actions),
        },
        !actions && (containerClassName || className),
        !spaceless && `mb-${space}`,
      )}
      controlId={controlId}
    >
      {quickAction || (tooltip && tooltipEnd) ? (
        <div className="flex items-end">
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
      <FormGroupA11yContext.Provider value={a11y}>
        <div>{children}</div>
      </FormGroupA11yContext.Provider>
      {description && (
        <Form.Text id={a11y.descriptionId}>{description}</Form.Text>
      )}
      {hasError && <FieldError id={a11y.errorId} error={shownError} />}
    </Form.Group>
  );

  if (actions) {
    return (
      <div
        className={classNames(
          'flex items-start gap-4',
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
