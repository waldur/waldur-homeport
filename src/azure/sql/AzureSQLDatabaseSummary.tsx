import * as React from 'react';

import { AzureSQLDatabase } from '@waldur/azure/common/types';
import { withTranslation } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

import { PureAzureResourceSummary } from '../AzureResourceSummary';

const PureAzureSQLDatabaseSummary = (props: ResourceSummaryProps<AzureSQLDatabase>) => {
  const { translate, resource } = props;
  return (
    <>
      <PureAzureResourceSummary {...props}/>
      <Field label={translate('Server')}>
        <ResourceLink
          type="Azure.SQLServer"
          uuid={resource.server_uuid}
          label={resource.server_name}
        />
      </Field>
      <Field label={translate('Charset')}>
        {resource.charset}
      </Field>
      <Field label={translate('Collation')}>
        {resource.collation}
      </Field>
    </>
  );
};

export const AzureSQLDatabaseSummary = withTranslation(PureAzureSQLDatabaseSummary);
