import classNames from 'classnames';
import { FunctionComponent } from 'react';

export const WizardStepsList: FunctionComponent<{ steps; step }> = ({
  steps,
  step,
}) => (
  <div className="stepper stepper-pills d-flex flex-column w-100">
    <div className="stepper-nav flex-wrap align-items-start justify-content-around w-100">
      {steps.map((stepItem, i) => (
        <div
          key={i}
          className={classNames('stepper-item', {
            first: i === 0,
            current: i === step,
            disabled: i > step,
          })}
          style={{ width: 100 / steps.length + '%' }}
        >
          <div className="stepper-wrapper d-flex flex-column align-items-center">
            <div className="stepper-icon w-35px h-35px">
              <span className="stepper-number">{i + 1}</span>
            </div>
            <div className="stepper-line-area h-35px">
              <div className="stepper-line"></div>
            </div>

            <div className="stepper-label">
              <h3 className="stepper-title">{stepItem}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
