import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

export const OpenStackFloatingIpSummary = (props: ResourceSummaryProps) => {
  const { resource } = props;
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <Component
        label={translate('Runtime state')}
        value={resource.runtime_state}
      />
      <Component
        label={translate('Backend ID')}
        value={renderFieldOrDash(resource.backend_id)}
        hasCopy={!!resource.backend_id}
      />
    </>
  );
};
