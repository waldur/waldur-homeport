import { Card, FormCheck } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { translate } from '@waldur/i18n';
import { TosNotification } from '@waldur/marketplace/deploy/TosNotification';
import { scrollToView } from '@waldur/marketplace/deploy/utils';
import { ProposalCreationFormStep } from '@waldur/proposals/types';

import { SubmitButton } from './SubmitButton';

interface CompletionPageSidebarProps {
  steps: ProposalCreationFormStep[];
  completedSteps: boolean[];
  submitting: boolean;
}

export const CompletionPageSidebar = (props: CompletionPageSidebarProps) => {
  const isVerticalMode = useMediaQuery({ maxWidth: 1200 });

  return (
    <div
      className={
        isVerticalMode
          ? 'proposal-manage-sidebar container-xxl'
          : 'proposal-manage-sidebar drawer drawer-end drawer-on'
      }
    >
      <Card className="card-flush border-0">
        <Card.Body>
          <h6 className="fs-7 ms-12">{translate('Application progress')}</h6>

          <div className="stepper stepper-pills stepper-column d-flex flex-column mb-10">
            <div className="d-flex flex-row-auto w-100 w-lg-300px">
              <div className="stepper-nav">
                {props.steps.map((step, i) => (
                  <div
                    key={i}
                    className={
                      'stepper-item me-5' +
                      (props.completedSteps[i] ? ' completed' : '')
                    }
                  >
                    <div className="stepper-wrapper d-flex align-items-center">
                      <FormCheck className="stepper-icon form-check form-check-custom form-check-sm">
                        <FormCheck.Input
                          type="checkbox"
                          checked={props.completedSteps[i]}
                          className="rounded-circle"
                          readOnly
                        />
                      </FormCheck>

                      <div
                        className="stepper-label"
                        aria-hidden="true"
                        onClick={() => scrollToView(step.id)}
                      >
                        <h3 className="stepper-title">
                          {i + 1}. {step.label}
                        </h3>
                      </div>
                    </div>

                    <div className="stepper-line h-20px"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="block-summary bg-gray-100 mb-10 fs-8 fw-bold">
            Summary
          </div>

          {/* Clicking on this button will trigger submit on the parent form */}
          <SubmitButton
            title={translate('Update project details')}
            className="w-100"
            loading={props.submitting}
          />

          <TosNotification />
        </Card.Body>
      </Card>
    </div>
  );
};
