import { WarningCircleIcon } from '@phosphor-icons/react';
import React, { ReactNode, useState } from 'react';
import { useDispatch } from 'react-redux';

import { StringField, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { ModalDialog } from './ModalDialog';
import { ConfirmationDialogType } from './types';

interface ConfirmationDialogProps {
  resolve: {
    deferred: {
      resolve: (value?: any) => void;
      reject: () => void;
    };
    title: ReactNode;
    body: ReactNode;
    nb?: ReactNode;
    type?: ConfirmationDialogType;
    positiveButton?: string;
    negativeButton?: string;
    positiveButtonVariant?: string;
    onlyPositiveButton?: boolean;
    iconNode?: ReactNode;
    showInput?: boolean;
    inputRequired?: boolean;
    inputLabel?: string;
    inputPlaceholder?: string;
  };
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
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
    showInput = false,
    inputRequired = false,
    inputLabel,
    inputPlaceholder,
  },
}) => {
  const dispatch = useDispatch();
  const closeDialog = () => dispatch(closeModalDialog('HIDE_CONFIRM'));
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (showInput && inputRequired && !inputValue.trim()) {
      return;
    }
    deferred.resolve(showInput ? inputValue : undefined);
    closeDialog();
  };

  const handleCancel = () => {
    deferred.reject();
    closeDialog();
  };

  return (
    <ModalDialog
      title={title}
      iconNode={iconNode || <WarningCircleIcon weight="bold" />}
      iconColor={type}
      bodyClassName="text-quaternary"
      closeButton={!onlyPositiveButton}
      onHide={handleCancel}
      footer={
        <>
          {!onlyPositiveButton && (
            <CloseDialogButton
              label={negativeButton}
              className="flex-equal px-3"
              onClick={handleCancel}
            />
          )}
          <SubmitButton
            submitting={false}
            variant={positiveButtonVariant}
            className={onlyPositiveButton ? undefined : 'flex-equal px-3'}
            onClick={handleSubmit}
            disabled={showInput && inputRequired && !inputValue.trim()}
            type="button"
            label={positiveButton}
          />
        </>
      }
    >
      <div>
        {body}
        {showInput && (
          <div className="mt-3">
            <StringField
              label={inputLabel}
              placeholder={inputPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              required={inputRequired}
            />
          </div>
        )}
      </div>
    </ModalDialog>
  );
};
