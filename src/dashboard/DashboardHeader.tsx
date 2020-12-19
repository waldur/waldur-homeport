import React, { FunctionComponent } from 'react';

interface DashboardHeaderProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
}

export const DashboardHeader: FunctionComponent<DashboardHeaderProps> = (
  props,
) => (
  <div
    style={{
      margin: -15,
      paddingTop: 10,
      paddingLeft: 25,
      marginBottom: 0,
    }}
  >
    <h2>{props.title}</h2>
    <p style={{ fontSize: 15 }}>{props.subtitle}</p>
  </div>
);
