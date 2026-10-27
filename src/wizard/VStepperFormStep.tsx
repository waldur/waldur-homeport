import classNames from 'classnames';
import React, { FC, PropsWithChildren } from 'react';
import { Card } from 'react-bootstrap';

import { AlertItem } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { RefreshButton } from '@/marketplace/offerings/update/components/RefreshButton';

import './VStepperFormStep.scss';

export interface VStepperFormStep<T = VStepperFormStepProps> {
  label: string;
  id: string;
  component: React.ComponentType<T>;
  params?: Record<string, any>;
  fields?: Array<string>;
  required?: boolean;
  requiredFields?: Array<string>;
  isActive?: (data?: any) => boolean;
}

export interface VStepperFormStepProps {
  id: string;
  title?: string;
  disabled?: boolean;
  disabledTooltip?: string;
  change?(field: string, value: any): void;
  params?: VStepperFormStep['params'];
}

interface StepCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  id?: string;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  disabledTooltip?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  refetch?(): void;
  refetching?: boolean;
}

// A locked step states why up front rather than in a hover tooltip.
const StepDisabledNotice: FC<{ disabled?: boolean; reason?: string }> = ({
  disabled,
  reason,
}) =>
  disabled && reason ? (
    <AlertItem type="floating" title={reason} className="mb-5" />
  ) : null;

/**
 * Content of a step that can be locked (e.g. no organization/project yet).
 * The fieldset disables every native control inside; the blocker still
 * catches clicks on non-native widgets such as react-select.
 */
export const StepContent: FC<
  PropsWithChildren<{ disabled?: boolean; disabledReason?: string }>
> = ({ disabled, disabledReason, children }) => (
  <>
    {disabled && <div className="step-blocker" />}
    <StepDisabledNotice disabled={disabled} reason={disabledReason} />
    <fieldset className="step-fieldset" disabled={disabled}>
      {children}
    </fieldset>
  </>
);

export const VStepperFormStepCard: FC<PropsWithChildren<StepCardProps>> = (
  props,
) => {
  return (
    <Card
      className={classNames(
        'step-card card-bordered',
        props.disabled && 'step-disabled',
        props.className,
      )}
      id={props.id}
      data-testid={props.id}
    >
      {props.disabled && <div className="step-blocker" />}
      <fieldset className="step-fieldset" disabled={props.disabled}>
        <Card.Header className="gap-1.5">
          <div className="flex items-center me-1.5">
            <div>
              <h4 className="mb-0">{props.title}</h4>
              {props.subtitle && (
                <small className="text-sm font-normal block mt-1.5">
                  {props.subtitle}
                </small>
              )}
            </div>
            {props.refetch && (
              <div className="ms-1.5">
                <RefreshButton
                  loading={props.refetching}
                  refetch={props.refetch}
                />
              </div>
            )}
          </div>
          {props.actions && <div className="flex ms-auto">{props.actions}</div>}
        </Card.Header>
        <Card.Body>
          <StepDisabledNotice
            disabled={props.disabled}
            reason={props.disabledTooltip}
          />
          {props.loading ? <LoadingSpinner /> : props.children}
        </Card.Body>
      </fieldset>
    </Card>
  );
};
