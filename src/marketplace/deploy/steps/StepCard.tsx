import { uniqueId } from 'lodash';
import React, { FC } from 'react';
import { Card, FormCheck } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';

interface StepCardProps {
  title: string;
  helpText?: string;
  actions?: React.ReactNode;
  step?: number;
  id?: string;
  completed?: boolean;
  loading?: boolean;
}

export const StepCard: FC<StepCardProps> = (props) => {
  return (
    <Card className="deploy-step-card card-flush" id={props.id}>
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
          <h6 className="mb-0">
            {props.step ? `${props.step}. ${props.title}` : props.title}
          </h6>
          {props.helpText && (
            <Tip
              label={props.helpText}
              id={uniqueId('stepCardTip')}
              className="ms-2"
            >
              <i className="fa fa-question-circle fs-5" />
            </Tip>
          )}
        </div>
        {props.actions && (
          <div className="d-flex flex-grow-1">{props.actions}</div>
        )}
      </Card.Header>
      <Card.Body className="pt-0 ps-16">
        {props.loading ? <LoadingSpinner /> : props.children}
      </Card.Body>
    </Card>
  );
};
