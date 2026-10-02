import { FC, ReactNode } from 'react';
import { useFormState } from 'react-final-form';

import { ButtonVariant } from 'waldur-ui';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';

import { SubmitButton } from './SubmitButton';

interface FormFooterProps {
  /** Submit button label - defaults to 'Submit' */
  submitLabel?: string;
  /** Cancel button label - defaults to 'Cancel' */
  cancelLabel?: string;
  /** Custom cancel handler - if not provided, uses default dialog close */
  onCancel?: () => void;
  /** Disable all buttons */
  disabled?: boolean;
  /** Disable only the submit button, e.g. while there is nothing to submit */
  submitDisabled?: boolean;
  /** Tooltip explaining why the submit button is disabled */
  submitDisabledReason?: string;
  /** Show cancel button - defaults to true */
  showCancel?: boolean;
  /** Apply flex-equal class for full-width buttons */
  fullWidth?: boolean;
  /** Bootstrap variant for submit button - defaults to 'primary' */
  submitVariant?: ButtonVariant;
  /** Additional buttons to render (e.g., Accept, Reject) */
  extraButtons?: ReactNode;
  /** Position of extra buttons - 'start' renders before cancel, 'end' renders after submit */
  extraButtonsPosition?: 'start' | 'end';
  /** Custom children for submit button (e.g., with icon) */
  submitChildren?: ReactNode;
}

/**
 * A standardized footer component for modal dialogs with forms.
 * Provides consistent Cancel + Submit button layout.
 *
 * @example
 * ```tsx
 * // Simple usage
 * <FormFooter />
 *
 * // With custom labels
 * <FormFooter
 *   submitLabel={translate('Save')}
 *   cancelLabel={translate('Discard')}
 * />
 *
 * // Without cancel button
 * <FormFooter showCancel={false} />
 *
 * // Full-width buttons
 * <FormFooter fullWidth />
 *
 * // With extra buttons
 * <FormFooter
 *   extraButtons={<AcceptButton />}
 * />
 * ```
 */
export const FormFooter: FC<FormFooterProps> = ({
  submitLabel,
  cancelLabel,
  onCancel,
  disabled,
  submitDisabled,
  submitDisabledReason,
  showCancel = true,
  fullWidth,
  submitVariant = 'primary',
  extraButtons,
  extraButtonsPosition = 'start',
  submitChildren,
}) => {
  const { submitting, invalid } = useFormState();
  const buttonClassName = fullWidth ? 'flex-equal' : undefined;

  return (
    <>
      {extraButtonsPosition === 'start' && extraButtons}
      {showCancel && (
        <CloseDialogButton
          label={cancelLabel || translate('Cancel')}
          className={buttonClassName}
          onClick={onCancel}
          disabled={disabled}
        />
      )}
      <SubmitButton
        submitting={submitting}
        label={submitLabel || translate('Submit')}
        variant={submitVariant}
        className={buttonClassName}
        disabled={disabled || submitDisabled}
        disabledReason={submitDisabled ? submitDisabledReason : undefined}
        invalid={invalid}
      >
        {submitChildren}
      </SubmitButton>
      {extraButtonsPosition === 'end' && extraButtons}
    </>
  );
};
