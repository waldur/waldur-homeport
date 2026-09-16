import { FC, ReactNode } from 'react';
import { AccountSetting } from 'waldur-js-client';

import { BaseButton } from '@/core/buttons/BaseButton';
import { translate } from '@/i18n';

interface AccountSettingValueProps {
  setting: AccountSetting;
  /** Display for the effective value, e.g. a select option label. */
  label?: ReactNode;
  /** Clears the offering's own value; omit when the user may not edit it. */
  onReset?(): void;
  /** Names what clearing the offering's value leads to. */
  resetLabel?: string;
}

/**
 * Effective value of an account setting together with where it comes from:
 * the offering itself, its service provider or the built-in default.
 */
export const AccountSettingValue: FC<AccountSettingValueProps> = ({
  setting,
  label,
  onReset,
  resetLabel,
}) => (
  <div className="d-flex flex-column align-items-start">
    <span>{label ?? setting.value}</span>
    {setting.source === 'provider' ? (
      <small className="text-muted">
        {translate('Inherited from service provider')}
      </small>
    ) : setting.source === 'default' ? (
      <small className="text-muted">{translate('Default')}</small>
    ) : onReset ? (
      <BaseButton
        variant="text-primary"
        size="sm"
        className="p-0"
        label={resetLabel ?? translate('Use provider setting')}
        onClick={onReset}
      />
    ) : null}
  </div>
);
