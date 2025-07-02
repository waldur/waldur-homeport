import { ReactNode } from 'react';
import { Resource } from 'waldur-js-client';

export interface DangerActionPanelProps {
  panelTitle: string;
  buttonTitle: string;
  checkboxLabel: string;
  panelDescription: ReactNode;
  issueSummary: string;
  sucessMessage: string;
  dialogTitle: string;
  dialogSubtitle: string;
  fallbackMessage: ReactNode;
  resource?: Resource;
}
