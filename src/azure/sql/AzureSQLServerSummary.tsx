import * as React from 'react';

import { AzureSQLServer } from '@waldur/azure/common/types';
import { Tooltip } from '@waldur/core/Tooltip';
import { formatFilesize } from '@waldur/core/utils';
import { withTranslation } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { UserPassword } from '@waldur/resource/UserPassword';

import { PureAzureResourceSummary } from '../AzureResourceSummary';

const ValueWithTooltip = ({ value, tooltip }) => (
  <>
    <Tooltip
      id="compute-generation"
      label={tooltip}>
      <i className="fa fa-question-circle"/>
    </Tooltip>
    {' '}
    {value}
  </>
);

const PureAzureSQLServerSummary = (props: ResourceSummaryProps<AzureSQLServer>) => {
  const { translate, resource } = props;
  return (
    <>
      <PureAzureResourceSummary {...props}/>
      {resource.fqdn && (
        <Field label={translate('Connection details')}>
          {`psql --host=${resource.fqdn} --port=5432 --username=${resource.username}@${resource.name} --dbname=postgres`}
        </Field>
      )}
      <Field label={translate('Password')}>
        <UserPassword password={resource.password}/>
      </Field>
      <Field label={translate('Pricing tier')}>
        <ValueWithTooltip
          value="Basic"
          // tslint:disable-next-line:max-line-length
          tooltip="Workloads that require light compute and I/O performance. Examples include servers used for development or testing or small-scale infrequently used applications."
        />
      </Field>
      <Field label={translate('Compute generation')}>
        <ValueWithTooltip
          value="5 Gen"
          tooltip="CPUs are based on Intel E5-2673 v4 (Broadwell) 2.3-GHz processors."
        />
      </Field>
      <Field label={translate('Storage size')}>
        {formatFilesize(resource.storage_mb || 5120)}
      </Field>
      <Field label={translate('vCores')}>
        1
      </Field>
      <Field label={translate('Memory per vCore')}>
        2 GB
      </Field>
      <Field label={translate('Storage type')}>
        Azure Standard Storage
      </Field>
    </>
  );
};

export const AzureSQLServerSummary = withTranslation(PureAzureSQLServerSummary);
