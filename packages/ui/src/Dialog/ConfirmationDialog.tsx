import { TrashIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { FC, ReactNode, useState } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { BaseButton, ButtonVariant } from '../Button';
import { cn } from '../cn';
import { FormField, FormLabel } from '../Form';
import { Input } from '../Input';

import { CloseDialogButton } from './CloseDialogButton';
import { ModalDialog } from './Modal';
import { useModal } from './modalContext';
import type {
  ConfirmationDialogType,
  ConfirmationExtraField,
} from './modalTypes';

interface Deferred<T = any> {
  resolve: (value?: T) => void;
  reject: () => void;
}

interface ConfirmationDialogProps {
  resolve: {
    deferred: Deferred;
    title: ReactNode;
    body: ReactNode;
    type?: ConfirmationDialogType;
    positiveButton?: string;
    negativeButton?: string;
    positiveButtonVariant?: ButtonVariant;
    onlyPositiveButton?: boolean;
    iconNode?: ReactNode;
    hideIcon?: boolean;
    bodyClassName?: string;
    showInput?: boolean;
    inputRequired?: boolean;
    inputLabel?: string;
    inputPlaceholder?: string;
    extraField?: ConfirmationExtraField;
  };
}

// The pair of footer buttons share the row equally (formerly Metronic's .flex-equal).
const EQUAL_BUTTON = 'flex-[1_0_0] px-[10.5px]';

/**
 * What `confirm()` opens: a yes/no question, optionally with a text input
 * (`showInput`) or an extra control (`extraField`). Resolves the confirm's
 * promise with `{ input, [extraField.resultKey] }` when either is used,
 * with nothing otherwise; rejects on cancel.
 */
export const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  resolve: {
    title,
    body,
    deferred,
    type = 'warning',
    positiveButton = translate('Yes'),
    negativeButton = translate('No'),
    positiveButtonVariant,
    onlyPositiveButton,
    iconNode,
    hideIcon = false,
    bodyClassName,
    showInput = false,
    inputRequired = false,
    inputLabel,
    inputPlaceholder,
    extraField,
  },
}) => {
  const { closeDialog: closeModal } = useModal();
  const closeDialog = () => closeModal('HIDE_CONFIRM');
  const [inputValue, setInputValue] = useState('');
  const [extraValue, setExtraValue] = useState<any>(null);
  const inputMissing = showInput && inputRequired && !inputValue.trim();

  const handleSubmit = () => {
    if (inputMissing) {
      return;
    }
    const result: Record<string, unknown> = {};
    if (showInput) {
      result.input = inputValue;
    }
    const hasExtra = Boolean(extraField && extraValue);
    if (hasExtra) {
      result[extraField.resultKey] = extraField.toResult
        ? extraField.toResult(extraValue)
        : extraValue;
    }
    deferred.resolve(showInput || hasExtra ? result : undefined);
    closeDialog();
  };

  const handleCancel = () => {
    deferred.reject();
    closeDialog();
  };

  return (
    <ModalDialog
      title={title}
      iconNode={
        hideIcon ? null : iconNode || <WarningCircleIcon weight="bold" />
      }
      iconColor={type}
      bodyClassName={cn('text-quaternary', bodyClassName)}
      closeButton={!onlyPositiveButton}
      onHide={handleCancel}
      footer={
        <>
          {!onlyPositiveButton && (
            <CloseDialogButton
              label={negativeButton}
              className={EQUAL_BUTTON}
              onClick={handleCancel}
            />
          )}
          <BaseButton
            variant={positiveButtonVariant}
            className={onlyPositiveButton ? undefined : EQUAL_BUTTON}
            onClick={handleSubmit}
            disabled={inputMissing}
            disabledReason={
              inputMissing
                ? translate('Please enter the required text to confirm')
                : undefined
            }
            label={positiveButton}
            size="lg"
          />
        </>
      }
    >
      <div>
        {body}
        {showInput && (
          <FormField className="mt-[10.5px]">
            <FormLabel required={inputRequired}>{inputLabel}</FormLabel>
            <Input
              type="text"
              placeholder={inputPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              required={inputRequired}
            />
          </FormField>
        )}
        {extraField?.render(extraValue, setExtraValue)}
      </div>
    </ModalDialog>
  );
};

interface DeleteConfirmationDialogProps {
  resolve: {
    deferred: Deferred<void>;
    title: ReactNode;
    body: ReactNode;
    iconNode?: ReactNode;
    /**
     * Both labels come from `ConfirmationOptions`, which `confirm` spreads into
     * `resolve`. They used to be dropped here while `ConfirmationDialog`
     * honoured them, so every `forDeletion` caller got "Delete" -- including
     * "Purge queue", which is a different operation, and the OpenStack actions
     * that remove an interface from a router rather than delete the router.
     */
    positiveButton?: string;
    negativeButton?: string;
  };
}

/** What `confirm(…, { forDeletion: true })` opens. */
export const DeleteConfirmationDialog: FC<DeleteConfirmationDialogProps> = ({
  resolve: { title, body, deferred, iconNode, positiveButton, negativeButton },
}) => {
  const { closeDialog: closeModal } = useModal();
  const closeDialog = () => closeModal('HIDE_CONFIRM');

  const handleSubmit = () => {
    deferred.resolve();
    closeDialog();
  };

  const handleCancel = () => {
    deferred.reject();
    closeDialog();
  };

  return (
    <ModalDialog
      title={title}
      iconNode={iconNode || <TrashIcon weight="bold" />}
      iconColor="danger"
      bodyClassName="text-quaternary pt-[8px]"
      footer={
        <>
          <CloseDialogButton
            label={negativeButton}
            className="min-w-[150px]"
            onClick={handleCancel}
          />
          <BaseButton
            variant="danger"
            className="min-w-[150px]"
            onClick={handleSubmit}
            label={positiveButton || translate('Delete')}
            size="lg"
          />
        </>
      }
    >
      {body}
    </ModalDialog>
  );
};
