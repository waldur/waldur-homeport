import { VStepperFormStep } from './VStepperFormStep';

export interface SidebarProps {
  steps?: VStepperFormStep[];
  completedSteps?: boolean[];
  disabledSteps?: boolean[];
  submitting?: boolean;
}
