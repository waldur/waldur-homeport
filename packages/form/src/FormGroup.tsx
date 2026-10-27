import classNames from 'classnames';
import {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react';
import { FieldMetaState } from 'react-final-form';
import {
  FormField,
  FormFieldset,
  FormLabel,
  FormLegend,
  FormText,
  HelpIcon,
  TooltipProps,
} from 'waldur-ui';

import { FieldError } from './FieldError';

/**
 * The bottom margin `space` selects, as a Tailwind spacing step. Each class
 * is a literal because Tailwind only generates the names it finds in source.
 */
export const SPACE_CLASSES = {
  0: 'mb-0',
  1: 'mb-1',
  1.5: 'mb-1.5',
  2.5: 'mb-2.5',
  3: 'mb-3',
  4: 'mb-4',
  5.5: 'mb-5.5',
  6: 'mb-6',
} as const;

export type Space = keyof typeof SPACE_CLASSES;

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
  space?: Space;

  // React Final Form
  input?: any;
  meta?: Partial<FieldMetaState<any>> & { submitError?: any };
  noUpdateOnBlur?: boolean;
  forceTouched?: boolean;

  id?: string;
  controlId?: string;
  /**
   * The group holds several controls (a start and an end, a select and a
   * custom value, a list of rows). It is drawn as a fieldset named by the
   * label, as a legend, and each control inside names itself; the default
   * points one label at one control, which is wrong for several.
   */
  group?: boolean;
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
    space = 5.5,
    id,
    controlId: propsControlId,
    group,
  } = props;

  const tooltip = propsTooltip || help;
  const tooltipEnd = propsTooltipEnd || helpEnd;

  // Only an id somebody asked for. Otherwise each control takes an id of its
  // own and the label points at the first, so a group holding several controls
  // (selects, pickers, a list of rows) never repeats one id.
  const controlId = propsControlId || id;

  // The ids of the label, help and error text, for a control that wires its
  // ARIA itself (the date pickers, through useFormGroupA11y). Derived from
  // the group, not the control, since the group need not have a control id.
  const ownId = useId();
  const baseId = controlId || ownId;
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
      labelId: hasLabel ? `${baseId}-label` : undefined,
      descriptionId: hasDescription ? `${baseId}-description` : undefined,
      errorId: hasError ? `${baseId}-error` : undefined,
      setControlError,
    }),
    [baseId, hasLabel, hasDescription, hasError],
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
      {label &&
        (group ? (
          <FormLegend id={a11y.labelId} required={required} className="me-auto">
            {label}
          </FormLegend>
        ) : (
          <FormLabel id={a11y.labelId} required={required} className="me-auto">
            {label}
          </FormLabel>
        ))}
    </>
  );

  const fieldClassName = classNames(
    {
      grow: Boolean(actions),
    },
    !actions && (containerClassName || className),
    !spaceless && SPACE_CLASSES[space],
  );
  const Wrapper = group ? FormFieldset : FormField;
  const mainContent = (
    <Wrapper className={fieldClassName} {...(group ? {} : { controlId })}>
      {quickAction || (tooltip && tooltipEnd) ? (
        <div className="flex items-end">
          {labelNode && <span className="me-auto">{labelNode}</span>}
          {quickAction}
          {tooltip && tooltipEnd && (
            <HelpIcon
              label={tooltip}
              className="ms-1.5 mb-1.5 h-5 items-center"
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
        <FormText id={a11y.descriptionId}>{description}</FormText>
      )}
      {hasError && <FieldError id={a11y.errorId} error={shownError} />}
    </Wrapper>
  );

  if (actions) {
    return (
      <div
        className={classNames(
          'flex items-start gap-3',
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
