import * as React from 'react';
import { compose } from 'redux';

import { VMOverviewFilter } from '@waldur/analytics/VMOverviewFilter';
import { VMTypeOverview } from '@waldur/analytics/VMTypeOverview';
import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

const VMTypeOverviewComponent = props => {
  return (
    <>
      <VMOverviewFilter {...props}/>
      <VMTypeOverview {...props}/>
    </>
  );
};

const enhance = compose(
  withTranslation,
);

const VMTypeOverviewContainer = enhance(VMTypeOverviewComponent);
export default connectAngularComponent(VMTypeOverviewContainer);
