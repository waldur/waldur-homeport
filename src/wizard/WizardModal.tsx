import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { wrapTooltip } from '@waldur/table/ActionButton';

import type { WizardStepProps } from './types';
import { WizardStepIndicator } from './WizardStepIndicator';

import './wizard.scss';

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
 *     <FormGroup label="Name">
 *       <Field name="name" component={StringField} />
 *     </FormGroup>
 *   </WizardModal>
 * );
 * ```
 */
export const WizardModal: FC<WizardModalProps> = ({ modalProps, ...props }) => {
  const isLastStep = props.step === props.steps.length - 1;

  return (
    <form
      className="wizard"
      onSubmit={props.handleSubmit}
      data-testid="wizard-dialog"
    >
      <ModalDialog
        title={props.title}
        subtitle={props.subtitle}
        footer={
          props.renderFooter ? (
            props.renderFooter()
          ) : (
            <>
              {props.step > 0 && (
                <SubmitButton
                  submitting={false}
                  variant="tertiary"
                  className="min-w-125px me-auto"
                  onClick={() => props.onPrev(props.values)}
                  type="button"
                  label={translate('Back')}
                  iconNode={<CaretLeftIcon weight="bold" />}
                  iconOnLeft
                  data-testid="wizard-back-btn"
                />
              )}
              <CloseDialogButton className="min-w-125px" />
              {typeof props.actions === 'function'
                ? props.actions({ values: props.values })
                : props.actions}
              {wrapTooltip(
                props.submitTooltip,
                <SubmitButton
                  submitting={props.submitting}
                  label={props.submitLabel}
                  invalid={
                    props.submitDisabled || props.loading || props.invalid
                  }
                  className="btn-icon-right min-w-125px"
                  data-testid="wizard-submit-btn"
                  children={
                    props.loading ? (
                      <span className="svg-icon svg-icon-2">
                        {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
                        <LoadingSpinnerIcon />
                      </span>
                    ) : !isLastStep ? (
                      <span className="svg-icon svg-icon-2">
                        <CaretRightIcon weight="bold" />
                      </span>
                    ) : null
                  }
                />,
              )}
            </>
          )
        }
        closeButton
        headerClassName="pb-5"
        {...(modalProps || {})}
      >
        <div className="wizard-big wizard-body clearfix">
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

          <div className="content clearfix">{props.children}</div>
        </div>
      </ModalDialog>
    </form>
  );
};
