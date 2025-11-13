import { QuestionIcon } from '@phosphor-icons/react';
import { AzureSqlServer } from 'waldur-js-client';

import { Tip } from '@waldur/core/Tooltip';
import { formatFilesize } from '@waldur/core/utils';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { UserPassword } from '@waldur/resource/UserPassword';

import { PureAzureResourceSummary } from '../AzureResourceSummary';

const ValueWithTooltip = ({ value, tooltip }) => (
  <>
    <Tip id="compute-generation" label={tooltip}>
      <QuestionIcon size={17} weight="bold" />
    </Tip>{' '}
    {value}
  </>
);

export const AzureSQLServerSummary = (
  props: ResourceSummaryProps<AzureSqlServer>,
) => {
  const { resource } = props;
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <PureAzureResourceSummary {...props} />
      {resource.fqdn && (
        <Component label={translate('Connection details')}>
          {`psql --host=${resource.fqdn} --port=5432 --username=${resource.username}@${resource.name} --dbname=postgres`}
        </Component>
      )}
      <Component label={translate('Password')}>
        <UserPassword password={resource.password} />
      </Component>
      <Component label={translate('Pricing tier')}>
        <ValueWithTooltip
          value="Basic"
          tooltip="Workloads that require light compute and I/O performance. Examples include servers used for development or testing or small-scale infrequently used applications."
        />
      </Component>
      <Component label={translate('Compute generation')}>
        <ValueWithTooltip
          value="5 Gen"
          tooltip="CPUs are based on Intel E5-2673 v4 (Broadwell) 2.3-GHz processors."
        />
      </Component>
      <Component label={translate('Storage size')}>
        {formatFilesize(resource.storage_mb || 5120)}
      </Component>
      <Component label={translate('vCores')}>1</Component>
      <Component label={translate('Memory per vCore')}>2 GB</Component>
      <Component label={translate('Storage type')}>
        Azure Standard Storage
      </Component>
    </>
  );
};
