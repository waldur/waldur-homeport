import * as React from 'react';

import { react2angular } from '@waldur/shims/react2angular';

export const LoadingSpinner = () => (
  <h1 className="text-center">
    <i className="fa fa-spinner fa-spin"/>
  </h1>
);

export default react2angular(LoadingSpinner);
