import React, { FunctionComponent } from 'react';

interface DashboardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}

export const DashboardHeader: FunctionComponent<DashboardHeaderProps> = (
  props,
) => (
  <div>
    <h2>{props.title}</h2>
    {props.subtitle && <p style={{ fontSize: 15 }}>{props.subtitle}</p>}
  </div>
);
