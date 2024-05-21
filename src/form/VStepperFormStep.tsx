import { Question } from '@phosphor-icons/react';
import { uniqueId } from 'lodash';
import React, { FC, PropsWithChildren } from 'react';
import { Card, FormCheck } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';

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
  step?: number;
  id: string;
  title?: string;
  observed?: boolean;
  required?: boolean;
  disabled?: boolean;
  change?(field: string, value: any): void;
  params?: VStepperFormStep['params'];
}

interface StepCardProps {
  title: string;
  helpText?: string;
  actions?: React.ReactNode;
  step?: number;
  id?: string;
  completed?: boolean;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  refetch?(): void;
  refetching?: boolean;
}

export const VStepperFormStepCard: FC<PropsWithChildren<StepCardProps>> = (
  props,
) => {
  return (
    <Card className={'step-card card-flush ' + props.className} id={props.id}>
      <Card.Header className="ps-5">
        <div className="d-flex align-items-center me-2">
          <FormCheck className="form-check form-check-custom form-check-sm me-6">
            <FormCheck.Input
              type="checkbox"
              className="rounded-circle"
              checked={props.completed}
              readOnly
            />
          </FormCheck>
          <h6 className={'mb-0' + (props.required ? ' required' : '')}>
            {props.step ? `${props.step}. ${props.title}` : props.title}
          </h6>
          {props.helpText && (
            <Tip
              label={props.helpText}
              id={uniqueId('stepCardTip')}
              className="ms-2"
            >
              <Question size={17} />
            </Tip>
          )}
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
          <div className="d-flex flex-grow-1">{props.actions}</div>
        )}
      </Card.Header>
      <Card.Body className="pt-0 ps-16 position-relative">
        {props.disabled && (
          <div className="blocker position-absolute z-index-1 w-100 h-100 cursor-not-allowed" />
        )}
        {props.loading ? <LoadingSpinner /> : props.children}
      </Card.Body>
    </Card>
  );
};
