import { WarningCircleIcon } from '@phosphor-icons/react';
import React, { ReactNode, useState } from 'react';
import { Form } from 'react-bootstrap';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';

import { ModalDialog } from './ModalDialog';
import { RouterSelector } from './RouterSelector';
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
    showRouterSelect?: boolean;
    tenantUuid?: string;
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
    showRouterSelect = false,
    tenantUuid,
  },
}) => {
  const { closeDialog: closeModal } = useModal();
  const closeDialog = () => closeModal('HIDE_CONFIRM');
  const [inputValue, setInputValue] = useState('');
  const [routerValue, setRouterValue] = useState(null);

  const handleSubmit = () => {
    if (showInput && inputRequired && !inputValue.trim()) {
      return;
    }
    const result: any = {};
    if (showInput) {
      result.input = inputValue;
    }
    if (showRouterSelect && routerValue) {
      result.router = routerValue.url;
    }
    deferred.resolve(
      showInput || (showRouterSelect && routerValue) ? result : undefined,
    );
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
            variant={positiveButtonVariant}
            className={onlyPositiveButton ? undefined : 'flex-equal px-3'}
            onClick={handleSubmit}
            disabled={showInput && inputRequired && !inputValue.trim()}
            type="button"
            submitting={false}
            label={positiveButton}
          />
        </>
      }
    >
      <div>
        {body}
        {showInput && (
          <div className="mt-3">
            <Form.Label>
              {inputLabel}
              {inputRequired && <span className="text-danger"> *</span>}
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={inputPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              required={inputRequired}
            />
          </div>
        )}
        {showRouterSelect && (
          <RouterSelector
            routerValue={routerValue}
            setRouterValue={setRouterValue}
            tenantUuid={tenantUuid}
          />
        )}
      </div>
    </ModalDialog>
  );
};
