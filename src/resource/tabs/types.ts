import * as React from 'react';

export interface ResourceTab {
  key: string;
  title: string;
  component: React.ComponentType<{ resource: any }>;
  feature?: string;
  isVisible?(resource): boolean;
}
