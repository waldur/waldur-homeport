import { FC, ReactNode } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { translate } from '@waldur/i18n';

import { FloatingButton } from './FloatingButton';
import { FormSteps } from './FormSteps';
import { TosNotification } from './TosNotification';
import { VStepperFormStep } from './VStepperFormStep';

interface VStepperFormSidebarProps {
  title?: string;
  steps?: VStepperFormStep[];
  completedSteps?: boolean[];
  submitting: boolean;
  header?: ReactNode;
  summary?: ReactNode;
  customSummary?: ReactNode;
  submitLabel?: string;
  submitDisabled?: boolean;
  hasSubmitButton?: boolean;
  hasTos?: boolean;
  extraNode?: ReactNode;
  errors?: any;
}

export type InjectedVStepperFormSidebarProps = Pick<
  VStepperFormSidebarProps,
  'steps' | 'completedSteps' | 'submitting'
>;

export const VStepperFormSidebar: FC<VStepperFormSidebarProps> = (props) => {
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
        <Card.Body>
          {props.header}

          {props.title && <h6 className="fs-7">{props.title}</h6>}

          {props.steps && (
            <FormSteps
              steps={props.steps}
              completedSteps={props.completedSteps}
              errors={props.errors}
            />
          )}

          {props.customSummary ? (
            props.customSummary
          ) : (
            <>
              {props.summary && (
                <div className="block-summary bg-gray-100 mb-10 fs-8 fw-bold">
                  {props.summary}
                </div>
              )}

              {/* Clicking on this button will trigger submit on the parent form */}
              {props.hasSubmitButton && (
                <FloatingButton>
                  <Button
                    size="sm"
                    variant="primary"
                    type="submit"
                    disabled={props.submitDisabled || props.submitting}
                    className="w-100"
                  >
                    {props.submitting && (
                      <i className="fa fa-spinner fa-spin me-1" />
                    )}
                    {props.submitLabel}
                  </Button>
                  )
                </FloatingButton>
              )}
            </>
          )}

          {props.hasTos && <TosNotification />}

          {props.extraNode}
        </Card.Body>
      </Card>
    </div>
  );
};

VStepperFormSidebar.defaultProps = {
  completedSteps: [],
  hasTos: true,
  hasSubmitButton: true,
  submitLabel: translate('Submit'),
};
