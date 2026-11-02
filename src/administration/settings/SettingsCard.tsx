import { FC, ReactNode } from 'react';

import { PropertyCard } from 'waldur-ui';

import { SettingsDescription } from '@/SettingsDescription';

import { SettingsPropertyList } from './SettingsPropertyList';
import { SettingGroupDescription, SettingItemDescription } from './types';

export interface SettingsCardProps {
  /** Single setting group to render. If provided, renders just this card. */
  group?: SettingGroupDescription;
  /** Filter SettingDescription by description strings. Ignored if group is provided. */
  groupNames?: string[];
  /** Key-value record of setting values. */
  values?: Record<string, any>;
  /** Legacy alias for `values`. */
  settingsSource?: Record<string, any>;
  /** Custom title for the card. Defaults to group.description. */
  title?: ReactNode;
  /** Custom action controls rendered in the card header. */
  actions?: ReactNode;
  /** Additional card container CSS class names. Defaults to 'mb-4'. */
  className?: string;
  /** Whether the card has a border. Defaults to true. */
  bordered?: boolean;
  /** Loading state passed to rows. */
  isLoading?: boolean;
  /** Custom value resolver for each item. Defaults to values[item.key]. */
  getValue?(item: SettingItemDescription, values?: Record<string, any>): any;
  /** Edit handler for items. */
  onEdit?(item: SettingItemDescription, values?: Record<string, any>): void;
  /** Per-item loading resolver. */
  getItemIsLoading?(
    item: SettingItemDescription,
    isLoading?: boolean,
  ): boolean | undefined;
  /** Custom disabled reason tooltip for edit button. */
  getEditDisabledReason?(item: SettingItemDescription): string | undefined;
}

export const SettingsCard: FC<SettingsCardProps> = ({
  group,
  groupNames,
  values,
  settingsSource,
  title,
  actions,
  className = 'mb-4',
  bordered = true,
  isLoading,
  getValue,
  onEdit,
  getItemIsLoading,
  getEditDisabledReason,
}) => {
  const resolvedValues = values ?? settingsSource;

  const groups: SettingGroupDescription[] = group
    ? [group]
    : groupNames
      ? (SettingsDescription.filter((g) =>
          groupNames.includes(g.description),
        ) as unknown as SettingGroupDescription[])
      : [];

  return (
    <>
      {groups.map((grp) => (
        <PropertyCard
          key={grp.description}
          bordered={bordered}
          title={title ?? grp.description}
          actions={actions}
          className={className}
        >
          <SettingsPropertyList
            items={grp.items}
            values={resolvedValues}
            getValue={getValue}
            onEdit={onEdit}
            isLoading={isLoading}
            getItemIsLoading={getItemIsLoading}
            getEditDisabledReason={getEditDisabledReason}
          />
        </PropertyCard>
      ))}
    </>
  );
};
