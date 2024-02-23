import React from 'react';
import { Button } from 'react-bootstrap';

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
        <Button
          key={tabItem.key}
          variant="link"
          size="sm"
          className={
            'btn-color-dark btn-active-color-primary mx-3' +
            (tab.key === tabItem.key ? ' active text-decoration-underline' : '')
          }
          onClick={() => setTab(tabItem)}
        >
          {tabItem.title}
        </Button>
      ))}
    </>
  );
};
