import {
  LockSimpleIcon,
  PencilSimpleIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { User } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { Tip } from '@/core/Tooltip';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { renderFieldOrDash } from '@/table/utils';

import { formatIsdName } from './IsdBadges';

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
  /** Identity Bridge attribute source info (auto-derived from user if not provided) */
  attributeSource?: { source: string; timestamp: string };
}

const EditFieldDialog = lazyComponent(() =>
  import('./EditFieldDialog').then((module) => ({
    default: module.EditFieldDialog,
  })),
);

export const UserEditRow = (props: RowProps) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditFieldDialog, {
      resolve: props,
      size: 'sm',
    });
  };

  const isEmpty = !props.value;
  const isProtected = props.protected;
  // Show warning only when required field is missing AND protected (user can't fix it)
  const showProtectedMissingWarning = props.required && isEmpty && isProtected;

  // Auto-derive attribute source from user when Identity Bridge feature is enabled
  const userSources = props.user.attribute_sources as Record<
    string,
    { source: string; timestamp: string }
  >;
  const attributeSource =
    props.attributeSource ||
    (isFeatureVisible(UserFeatures.show_identity_bridge)
      ? userSources?.[props.name]
      : undefined);

  const protectedTooltip = props.protectedMsg
    ? props.protectedMsg
    : attributeSource?.source
      ? translate('Managed by {source}. Last synced: {date}', {
          source: formatIsdName(attributeSource.source),
          date: formatDateTime(attributeSource.timestamp),
        })
      : props.user.identity_provider_label
        ? translate('Information is coming from {identityProvider}', {
            identityProvider: props.user.identity_provider_label,
          })
        : translate('Information is coming from identity provider');

  // Build the value display with appropriate indicators
  const valueDisplay = (
    <span className="d-inline-flex align-items-center gap-2">
      <span>{renderFieldOrDash(props.value)}</span>
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
