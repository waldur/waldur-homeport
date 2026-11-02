import { FC } from 'react';

import { PropertyList, PropertyListProps } from 'waldur-ui';

import { SettingItemRow } from './FieldRow';
import { SettingItemDescription } from './types';

export interface SettingsPropertyListProps extends Omit<
  PropertyListProps,
  'children'
> {
  items: SettingItemDescription[];
  values?: Record<string, any>;
  getValue?(item: SettingItemDescription, values?: Record<string, any>): any;
  onEdit?(item: SettingItemDescription, values?: Record<string, any>): void;
  isLoading?: boolean;
  getItemIsLoading?(
    item: SettingItemDescription,
    isLoading?: boolean,
  ): boolean | undefined;
  getEditDisabledReason?(item: SettingItemDescription): string | undefined;
}

/**
 * Canonical property list for rendering Mastermind settings from `SettingsDescription.ts`.
 * Automatically maps over items and binds values, edit triggers, and disabled reasons.
 */
export const SettingsPropertyList: FC<SettingsPropertyListProps> = ({
  items,
  values,
  getValue = (item, vals) => vals?.[item.key],
  onEdit,
  isLoading,
  getItemIsLoading,
  getEditDisabledReason,
  ...props
}) => {
  return (
    <PropertyList {...props}>
      {items.map((item) => (
        <SettingItemRow
          key={item.key}
          item={item}
          value={getValue(item, values)}
          onEdit={onEdit ? () => onEdit(item, values) : undefined}
          isLoading={
            getItemIsLoading ? getItemIsLoading(item, isLoading) : isLoading
          }
          editDisabledReason={getEditDisabledReason?.(item)}
        />
      ))}
    </PropertyList>
  );
};
