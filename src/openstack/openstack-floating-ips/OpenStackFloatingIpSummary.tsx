import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { Field, ResourceSummaryProps } from '@/resource/summary';
import { renderFieldOrDash } from '@/table/utils';

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
