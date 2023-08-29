import React from 'react';
import { Button } from 'react-bootstrap';

interface StepCardTabsProps {
  tab: any;
  setTab: React.Dispatch<React.SetStateAction<any>>;
  tabs: Array<{ label; value }>;
}

export const StepCardTabs: React.FC<StepCardTabsProps> = ({
  tab,
  setTab,
  tabs,
}) => {
  return (
    <>
      {tabs.map((tabItem) => (
        <Button
          key={tabItem.value}
          variant="link"
          size="sm"
          className={
            'btn-color-dark btn-active-color-primary mx-3' +
            (tab === tabItem.value ? ' active text-decoration-underline' : '')
          }
          onClick={() => setTab(tabItem.value)}
        >
          {tabItem.label}
        </Button>
      ))}
    </>
  );
};
