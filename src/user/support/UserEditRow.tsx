import {
  LockSimpleIcon,
  PencilSimpleIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { User } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { Tip } from '@waldur/core/Tooltip';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

interface RowProps {
  user: User;
  label: string;
  value: React.ReactNode;
  description?: string;
  /** Mark field as required (shows asterisk) */
  required?: boolean;
  disabled?: boolean;
  protected?: boolean;
  protectedMsg?: string;
  name: string;
  actions?: React.ReactNode;
}

const EditFieldDialog = lazyComponent(() =>
  import('./EditFieldDialog').then((module) => ({
    default: module.EditFieldDialog,
  })),
);

export const UserEditRow = (props: RowProps) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditFieldDialog, {
        resolve: props,
        size: 'sm',
      }),
    );
  };

  const isEmpty = !props.value;
  const isProtected = props.protected;
  // Show warning only when required field is missing AND protected (user can't fix it)
  const showProtectedMissingWarning = props.required && isEmpty && isProtected;

  const protectedTooltip = props.protectedMsg
    ? props.protectedMsg
    : props.user.identity_provider_label
      ? translate('Information is coming from {identityProvider}', {
          identityProvider: props.user.identity_provider_label,
        })
      : translate('Information is coming from identity provider');

  // Build the value display with appropriate indicators
  const valueDisplay = (
    <span className="d-inline-flex align-items-center gap-2">
      <span>{props.value || '—'}</span>
      {showProtectedMissingWarning && (
        <Tip
          label={translate('Required field not provided by {idp}', {
            idp:
              props.user.identity_provider_label ||
              translate('identity provider'),
          })}
          id={`${props.name}-warning`}
        >
          <WarningCircleIcon size={16} weight="bold" className="text-warning" />
        </Tip>
      )}
    </span>
  );

  return (
    <FormTable.Item
      label={props.label}
      description={props.description}
      value={valueDisplay}
      required={props.required}
      disabled={props.disabled}
      actions={
        props.actions || (
          <ActionButton
            action={callback}
            iconNode={
              isProtected ? (
                <LockSimpleIcon weight="bold" />
              ) : (
                <PencilSimpleIcon weight="bold" />
              )
            }
            variant="secondary"
            className="btn-sm btn-icon"
            disabled={isProtected || props.disabled}
            tooltip={isProtected ? protectedTooltip : undefined}
            data-testid={`user-edit-row-${props.name}`}
          />
        )
      }
    />
  );
};
