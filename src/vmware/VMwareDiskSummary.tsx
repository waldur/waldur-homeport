import { formatFilesize } from '@waldur/core/utils';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

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
