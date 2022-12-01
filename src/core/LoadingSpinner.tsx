import { FunctionComponent } from 'react';

export const LoadingSpinnerIcon = () => <i className="fa fa-spinner fa-spin" />;

export const LoadingSpinner: FunctionComponent = () => (
  <h1 className="text-center">
    <LoadingSpinnerIcon />
  </h1>
);
