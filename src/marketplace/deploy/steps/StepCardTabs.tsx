import classNames from 'classnames';
import React from 'react';

import { BaseButton } from 'waldur-ui';

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
        <BaseButton
          key={tabItem.key}
          variant={tab.key === tabItem.key ? 'text-primary' : 'text-secondary'}
          className={classNames(
            'mx-3',
            tab.key === tabItem.key && 'text-decoration-underline',
          )}
          onClick={() => setTab(tabItem)}
          label={tabItem.title}
          size="sm"
        />
      ))}
    </>
  );
};
