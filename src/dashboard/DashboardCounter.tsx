import React, { FunctionComponent } from 'react';

interface DashboardCounterProps {
  value: React.ReactNode;
  label: React.ReactNode;
}

export const DashboardCounter: FunctionComponent<DashboardCounterProps> = (
  props,
) =>
  props.value !== undefined ? (
    <div className="card card-xl-stretch-50 mb-5 mb-xl-8">
      <div className="card-body p-0 d-flex justify-content-between flex-column overflow-hidden">
        <div className="d-flex flex-stack flex-wrap flex-grow-1 px-9 pt-9 pb-3">
          <div className="me-2">
            <span className="fw-bolder text-gray-800 d-block fs-3">
              {props.label}
            </span>
          </div>
          <div className="fw-bolder fs-3 text-primary">{props.value}</div>
        </div>
        {props.children}
      </div>
    </div>
  ) : null;
