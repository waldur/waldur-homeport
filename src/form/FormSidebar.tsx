import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { VStepperFormStep } from './VStepperFormStep';

export interface SidebarProps {
  steps?: VStepperFormStep[];
  completedSteps?: boolean[];
  submitting: boolean;
}

export const FormSidebar: FC<{}> = (props) => {
  const isVMode = useMediaQuery({ maxWidth: 1200 });

  return (
    <div
      className={
        isVMode
          ? 'v-stepper-form-sidebar container-xxl'
          : 'v-stepper-form-sidebar drawer drawer-end drawer-on'
      }
    >
      <Card className="card-flush border-0 w-100">
        <Card.Body>{props.children}</Card.Body>
      </Card>
    </div>
  );
};
