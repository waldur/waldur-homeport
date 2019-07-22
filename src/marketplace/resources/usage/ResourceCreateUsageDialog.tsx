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
  <Query loader={getUsageComponents} variables={props.resolve}>
    {({ loading, error, data }) => (
      <ModalDialog
        title={translate('Resource usage for {resource}', {resource: props.resolve.resource_name})}
        footer={<ResourceUsageSubmitButton params={props.resolve}/>}>
        {
          loading ? <LoadingSpinner/> :
          error ? (
            <h3>{translate('Unable to load marketplace offering details.')}</h3>
          ) : (data.components.length === 0)  ? (
            <h3>{translate('Marketplace offering does not have any usage-based components.')}</h3>
          ) : (
            <ResourceUsageFormContainer
              params={props.resolve}
              components={data.components}
              periods={data.periods}
            />
          )
        }
      </ModalDialog>
    )}
  </Query>
);

export default connectAngularComponent(ResourceCreateUsageDialog, ['resolve']);
