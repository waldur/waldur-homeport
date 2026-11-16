import { StepDefinition } from 'waldur-wizard';

export interface SidebarProps {
  steps?: StepDefinition[];
  completedSteps?: boolean[];
  disabledSteps?: boolean[];
  submitting?: boolean;
}
