import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

interface WizardButtonsProps {
  goBack(): void;
  goNext(): void;
  submitting: boolean;
  invalid: boolean;
  isLastStep: boolean;
  submitLabel?: string;
}

export const WizardButtons: FunctionComponent<WizardButtonsProps> = ({
  isLastStep,
  goBack,
  goNext,
  submitting,
  invalid,
  submitLabel,
}) => (
  <div className="d-flex justify-content-between mt-3">
    <ActionButton
      title={translate('Back')}
      action={goBack}
      iconNode={<CaretLeft />}
      className={classNames(
        { disabled: submitting },
        'btn btn-outline btn-secondary',
      )}
    />
    {!isLastStep && (
      <ActionButton
        title={translate('Next')}
        action={goNext}
        iconNode={<CaretRight />}
        className="btn btn-primary"
      />
    )}
    {isLastStep && (
      <SubmitButton
        disabled={invalid}
        submitting={submitting}
        label={submitLabel || translate('Submit')}
      />
    )}
  </div>
);
