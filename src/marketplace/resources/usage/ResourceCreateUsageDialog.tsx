import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { getUsageComponents } from './api';
import { ResourceUsageFormContainer } from './ResourceUsageFormContainer';
import { ResourceUsageSubmitButton } from './ResourceUsageSubmitButton';
import { UsageReportContext } from './types';

interface ResourceCreateUsageDialogProps {
  resolve: UsageReportContext;
}

const ResourceCreateUsageDialog = (props: ResourceCreateUsageDialogProps) => (
  <ModalDialog
    title={translate('Resource usage')}
    footer={<ResourceUsageSubmitButton params={props.resolve}/>}>
    <Query loader={getUsageComponents} variables={props.resolve}>
      {({ loading, error, data }) => {
        if (loading) {
          return <LoadingSpinner/>;
        } else if (error) {
          return <h3>{translate('Unable to load marketplace offering details.')}</h3>;
        } else if (data.components.length === 0) {
          return <h3>{translate('Marketplace offering does not have any usage-based components.')}</h3>;
        } else {
          return (
            <ResourceUsageFormContainer
              params={props.resolve}
              components={data.components}
              periods={data.periods}
            />
          );
        }
      }}
    </Query>
  </ModalDialog>
);

export default connectAngularComponent(ResourceCreateUsageDialog, ['resolve']);
