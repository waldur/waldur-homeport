import { FunctionComponent } from 'react';

export const LoadingSpinnerIcon = ({ className }: { className? }) => (
  <i className={'fa fa-spinner fa-spin ' + (className || '')} />
);

export const LoadingSpinner: FunctionComponent = () => (
  <h1 className="text-center">
    <LoadingSpinnerIcon />
  </h1>
);
