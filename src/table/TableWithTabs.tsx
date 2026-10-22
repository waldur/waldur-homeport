import { FC } from 'react';

import { useUrlTab } from '@/navigation/useUrlTab';

import { BaseTableWithTabs, BaseTableWithTabsProps } from './BaseTableWithTabs';

/**
 * Homeport's tabbed table card: `BaseTableWithTabs`, with the open tab kept in
 * the URL query param `syncWithUrlKey` (through UI-Router) when given.
 */
export const TableWithTabs: FC<
  Omit<BaseTableWithTabsProps, 'activeKey' | 'onSelect'> & {
    syncWithUrlKey?: string;
  }
> = ({ syncWithUrlKey, ...props }) => {
  const { activeKey, handleSelect } = useUrlTab(props.tabs, syncWithUrlKey, {
    history: 'push',
  });
  return (
    <BaseTableWithTabs
      {...props}
      activeKey={activeKey}
      onSelect={handleSelect}
    />
  );
};
