import classNames from 'classnames';
import React, { FC, PropsWithChildren } from 'react';
import { Card } from 'react-bootstrap';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
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

export const VStepperFormStepCard: FC<PropsWithChildren<StepCardProps>> = (
  props,
) => {
  return (
    <Tip id={`tip-${props.id}`} label={props.disabledTooltip}>
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
        <Card.Header className="gap-2">
          <div className="d-flex align-items-center me-2">
            <div>
              <h4 className="mb-0">{props.title}</h4>
              {props.subtitle && (
                <small className="fs-6 fw-normal d-block mt-2">
                  {props.subtitle}
                </small>
              )}
            </div>
            {props.refetch && (
              <div className="ms-2">
                <RefreshButton
                  loading={props.refetching}
                  refetch={props.refetch}
                />
              </div>
            )}
          </div>
          {props.actions && (
            <div className="d-flex ms-auto">{props.actions}</div>
          )}
        </Card.Header>
        <Card.Body>
          {props.loading ? <LoadingSpinner /> : props.children}
        </Card.Body>
      </Card>
    </Tip>
  );
};
