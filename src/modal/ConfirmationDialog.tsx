import { WarningCircleIcon } from '@phosphor-icons/react';
import React, { ReactNode, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  openstackRoutersList,
  OpenstackRoutersListData,
} from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { SubmitButton } from '@waldur/form';
import { AsyncPaginate } from '@waldur/form/themed-select';
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
  const dispatch = useDispatch();
  const closeDialog = () => dispatch(closeModalDialog('HIDE_CONFIRM'));
  const [inputValue, setInputValue] = useState('');
  const [routerValue, setRouterValue] = useState(null);

  const loadRouters = async (query, prevOptions, { page }) => {
    if (!tenantUuid) {
      return {
        options: [],
        hasMore: false,
        additional: { page: 1 },
      };
    }

    const response = await openstackRoutersList({
      query: {
        tenant_uuid: tenantUuid,
        state: ['OK'],
        name: query,
        page,
        page_size: ENV.pageSize,
        field: ['uuid', 'url', 'name'],
      } as OpenstackRoutersListData['query'],
    });

    const selectData = parseSelectData(response);
    return returnReactSelectAsyncPaginateObject(
      {
        options: selectData.options.map((router) => ({
          value: router.url,
          label: router.name,
          ...router,
        })),
        totalItems: selectData.totalItems,
      },
      prevOptions,
      page,
    );
  };

  const handleSubmit = () => {
    if (showInput && inputRequired && !inputValue.trim()) {
      return;
    }
    const result: any = {};
    if (showInput) {
      result.input = inputValue;
    }
    if (showRouterSelect && routerValue) {
      result.router = routerValue.value;
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
          <div className="mt-3">
            <label className="form-label">
              {translate('Router')}{' '}
              <span className="text-muted">({translate('Optional')})</span>
            </label>
            <AsyncPaginate
              value={routerValue}
              onChange={setRouterValue}
              loadOptions={loadRouters}
              defaultOptions
              placeholder={translate('Select router...')}
              isClearable
              classNamePrefix="metronic-select"
              getOptionLabel={(option) => option.label || option.name}
              getOptionValue={(option) => option.value || option.url}
            />
          </div>
        )}
      </div>
    </ModalDialog>
  );
};
