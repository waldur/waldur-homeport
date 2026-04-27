import classNames from 'classnames';
import React from 'react';

import { CompactActionButton } from '@/table/CompactActionButton';

export interface TabSpec<T = any> {
  title: string;
  key: string;
  component?: React.ComponentType<T>;
}

interface StepCardTabsProps<T extends TabSpec> {
  tab: T;
  setTab: React.Dispatch<React.SetStateAction<T>>;
  tabs: T[];
}

export const StepCardTabs: React.FC<StepCardTabsProps<TabSpec<any>>> = ({
  tab,
  setTab,
  tabs,
}) => {
  return (
    <>
      {tabs.map((tabItem) => (
        <CompactActionButton
          key={tabItem.key}
          variant="link"
          className={classNames(
            'btn-color-dark btn-active-color-primary mx-3',
            tab.key === tabItem.key && 'active text-decoration-underline',
          )}
          action={() => setTab(tabItem)}
          title={tabItem.title}
        />
      ))}
    </>
  );
};
