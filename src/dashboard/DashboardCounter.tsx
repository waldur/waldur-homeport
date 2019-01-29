import * as React from 'react';

interface DashboardCounterProps {
  value: React.ReactNode;
  label: React.ReactNode;
}

export const DashboardCounter = (props: DashboardCounterProps) =>
  props.value ? (
    <>
      <h1 className="m-b-xs">
        {props.value}
      </h1>
      <p className="text-uppercase">{props.label}</p>
    </>
  ) : null;
