import { FunctionComponent } from 'react';

interface ChangedLimitFieldProps {
  changedLimit: number;
}

export const ChangedLimitField: FunctionComponent<ChangedLimitFieldProps> = ({
  changedLimit,
}) => (
  <p
    className="form-control-static"
    style={{
      color: changedLimit < 0 ? 'red' : changedLimit > 0 ? 'green' : 'inherit',
    }}
  >
    {changedLimit}
  </p>
);
