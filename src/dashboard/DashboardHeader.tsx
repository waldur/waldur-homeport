import * as React from 'react';

interface DashboardHeaderProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
}

export const DashboardHeader = (props: DashboardHeaderProps) => (
  <div style={{
    margin: -15,
    paddingTop: 10,
    paddingLeft: 25,
  }}>
    <h2>
      {props.title}
    </h2>
    <p style={{fontSize: 15}}>
      {props.subtitle}
    </p>
  </div>
);
