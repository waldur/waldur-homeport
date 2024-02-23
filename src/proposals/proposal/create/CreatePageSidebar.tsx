import { Card, FormCheck } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { Link } from '@waldur/core/Link';
import { formatJsx, translate } from '@waldur/i18n';
import { scrollToView } from '@waldur/marketplace/deploy/utils';
import { ProposalCreationFormStep } from '@waldur/proposals/types';

import { SubmitButton } from './SubmitButton';

interface CreatePageSidebarProps {
  steps: ProposalCreationFormStep[];
  completedSteps: boolean[];
  submitting: boolean;
}

export const CreatePageSidebar = (props: CreatePageSidebarProps) => {
  const isVerticalMode = useMediaQuery({ maxWidth: 1200 });

  return (
    <div
      className={
        isVerticalMode
          ? 'proposal-create-sidebar container-xxl'
          : 'proposal-create-sidebar drawer drawer-end drawer-on'
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

                      <a
                        className="stepper-label"
                        onClick={() => scrollToView(step.id)}
                      >
                        <h3 className="stepper-title">
                          {i + 1}. {step.label}
                        </h3>
                      </a>
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
            title={translate('Submit application')}
            className="w-100"
            loading={props.submitting}
          />

          <p className="text-center fs-9 mt-2 mb-0">
            {translate(
              'By ordering, you agree to the platform <tos>terms of service</tos> and <pp>privacy policy</pp>.',
              {
                tos: (s: string) => <Link state="about.tos" label={s} />,
                pp: (s: string) => <Link state="about.privacy" label={s} />,
              },
              formatJsx,
            )}
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};
