import { FC, ReactNode } from 'react';
import { ButtonVariant } from 'react-bootstrap/esm/types';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';

import { SubmitButton } from './SubmitButton';

interface FormFooterProps {
  /** Whether form is currently submitting */
  submitting: boolean;
  /** Submit button label - defaults to 'Submit' */
  submitLabel?: string;
  /** Cancel button label - defaults to 'Cancel' */
  cancelLabel?: string;
  /** Custom cancel handler - if not provided, uses default dialog close */
  onCancel?: () => void;
  /** Disable all buttons */
  disabled?: boolean;
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
  /** Pass invalid state to disable submit */
  invalid?: boolean;
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
 * <FormFooter submitting={submitting} />
 *
 * // With custom labels
 * <FormFooter
 *   submitting={submitting}
 *   submitLabel={translate('Save')}
 *   cancelLabel={translate('Discard')}
 * />
 *
 * // Without cancel button
 * <FormFooter submitting={submitting} showCancel={false} />
 *
 * // Full-width buttons
 * <FormFooter submitting={submitting} fullWidth />
 *
 * // With extra buttons
 * <FormFooter
 *   submitting={submitting}
 *   extraButtons={<AcceptButton />}
 * />
 * ```
 */
export const FormFooter: FC<FormFooterProps> = ({
  submitting,
  submitLabel,
  cancelLabel,
  onCancel,
  disabled,
  showCancel = true,
  fullWidth,
  submitVariant = 'primary',
  extraButtons,
  extraButtonsPosition = 'start',
  invalid,
  submitChildren,
}) => {
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
        disabled={disabled}
        invalid={invalid}
      >
        {submitChildren}
      </SubmitButton>
      {extraButtonsPosition === 'end' && extraButtons}
    </>
  );
};
