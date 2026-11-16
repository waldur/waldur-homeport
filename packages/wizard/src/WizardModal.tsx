import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { SubmitButton } from 'waldur-form';
import { translate } from 'waldur-i18n-runtime';
import { Tooltip, BaseButton, LoadingSpinner, cn } from 'waldur-ui';
import { CloseDialogButton } from 'waldur-ui';
import { ModalDialog } from 'waldur-ui';

import type { WizardStepProps } from './types';
import {
  WIZARD_BODY_CLASSNAME,
  WIZARD_CONTENT_CLASSNAME,
} from './wizardClasses';
import { WizardStepIndicator } from './WizardStepIndicator';

interface WizardModalProps extends WizardStepProps {
  children: ReactNode;
}

/**
 * Modal layout component for wizard steps.
 *
 * Provides consistent UI structure including:
 * - Modal header with title and subtitle
 * - Step indicator (when multiple steps exist)
 * - Navigation buttons (Back, Close, Next/Submit)
 * - Loading state indicator
 *
 * Step components should wrap their content with this component.
 *
 * @example
 * ```tsx
 * const MyStep: FC<WizardStepProps> = (props) => (
 *   <WizardModal {...props}>
 *     <StringGroup name="name" label="Name" />
 *   </WizardModal>
 * );
 * ```
 */
export const WizardModal: FC<WizardModalProps> = ({ modalProps, ...props }) => {
  const isLastStep = props.step === props.steps.length - 1;

  const submitButton = (
    <SubmitButton
      submitting={props.submitting}
      label={props.submitLabel}
      invalid={props.submitDisabled || props.loading || props.invalid}
      data-testid="wizard-submit-btn"
      // As iconNode, not children: children replace the label in
      // SubmitButton, which left the Next button wordless.
      iconNode={
        props.loading ? (
          <LoadingSpinner className="text-brand" />
        ) : !isLastStep ? (
          <CaretRightIcon weight="bold" />
        ) : null
      }
    />
  );

  return (
    <form onSubmit={props.handleSubmit} data-testid="wizard-dialog">
      <ModalDialog
        title={props.title}
        subtitle={props.subtitle}
        footer={
          props.renderFooter ? (
            props.renderFooter()
          ) : (
            <>
              {props.step > 0 && (
                <BaseButton
                  variant="tertiary"
                  className="min-w-dialog-action me-auto"
                  onClick={() => props.onPrev(props.values)}
                  label={translate('Back')}
                  iconNode={<CaretLeftIcon weight="bold" />}
                  data-testid="wizard-back-btn"
                  size="lg"
                />
              )}
              <CloseDialogButton />
              {typeof props.actions === 'function'
                ? props.actions({ values: props.values })
                : props.actions}
              {props.submitTooltip ? (
                <Tooltip label={props.submitTooltip}>
                  <span>{submitButton}</span>
                </Tooltip>
              ) : (
                submitButton
              )}
            </>
          )
        }
        headerClassName="pb-4"
        {...(modalProps || {})}
        bodyClassName={cn('p-0', modalProps?.bodyClassName)}
      >
        <div className={WIZARD_BODY_CLASSNAME}>
          {!props.hideStepper && props.steps.length > 1 && (
            <WizardStepIndicator
              steps={props.steps}
              value={props.steps[props.step]}
              onClick={(_, index) => {
                if (!props.onStep || props.submitDisabled || props.invalid)
                  return;
                if (index > props.step) {
                  props.handleSubmit();
                  if (props.valid) {
                    props.onStep(index);
                  }
                } else {
                  props.onStep(index);
                }
              }}
            />
          )}

          <div className={WIZARD_CONTENT_CLASSNAME}>{props.children}</div>
        </div>
      </ModalDialog>
    </form>
  );
};
