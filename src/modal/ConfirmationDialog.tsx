import { WarningCircleIcon } from '@phosphor-icons/react';
import React, { ReactNode, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';

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
      footer={
        <>
          {!onlyPositiveButton && (
            <Button
              variant="tertiary"
              className="flex-equal px-3"
              onClick={handleCancel}
            >
              {negativeButton}
            </Button>
          )}
          <Button
            variant={positiveButtonVariant}
            className={onlyPositiveButton ? undefined : 'flex-equal px-3'}
            onClick={handleSubmit}
            disabled={showInput && inputRequired && !inputValue.trim()}
          >
            {positiveButton}
          </Button>
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
