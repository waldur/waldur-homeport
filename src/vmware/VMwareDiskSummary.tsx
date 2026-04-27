import { formatFilesize } from '@/core/utils';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

export const VMwareDiskSummary = (props) => {
  const { resource } = props;
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <Component
      label={translate('Size')}
      value={formatFilesize(resource.size)}
    />
  );
};
