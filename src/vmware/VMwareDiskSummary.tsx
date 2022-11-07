import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const VMwareDiskSummary = (props) => {
  const { resource } = props;
  return (
    <Field label={translate('Size')} value={formatFilesize(resource.size)} />
  );
};
