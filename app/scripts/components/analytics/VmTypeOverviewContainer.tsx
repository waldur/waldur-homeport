import * as React from 'react';
import { compose } from 'redux';

import { VmOverviewFilter } from '@waldur/analytics/VmOverviewFilter';
import { VmTypeOverview } from '@waldur/analytics/VmTypeOverview';
import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

const VmTypeOverviewComponent = props => {
  return (
    <>
      <VmOverviewFilter {...props}/>
      <div className="ibox-content">
        <VmTypeOverview {...props}/>
      </div>
    </>
  );
};

const enhance = compose(
  withTranslation,
);

const VmTypeOverviewContainer = enhance(VmTypeOverviewComponent);
export default connectAngularComponent(VmTypeOverviewContainer);
