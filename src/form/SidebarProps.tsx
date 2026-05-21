import { VStepperFormStep } from '@/wizard';

export interface SidebarProps {
  steps?: VStepperFormStep[];
  completedSteps?: boolean[];
  disabledSteps?: boolean[];
  submitting?: boolean;
}
