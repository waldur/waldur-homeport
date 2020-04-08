import * as React from 'react';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { VmOverviewFilterContainer } from './VmOverviewFilterContainer';
import { VmTypeOverview } from './VmTypeOverview';

const VmTypeOverviewComponent = props => {
  return (
    <>
      <VmOverviewFilterContainer {...props} />
      <div className="ibox-content">
        <VmTypeOverview {...props} />
      </div>
    </>
  );
};

const enhance = compose(withTranslation);

const VmTypeOverviewContainer = enhance(VmTypeOverviewComponent);
export default connectAngularComponent(VmTypeOverviewContainer);
