import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

export const AddOfferingButton = () => {
  const callback = () => {
    // ignore
  };
  return (
    <ActionButton
      action={callback}
      title={translate('Add offering')}
      variant="primary"
    />
  );
};
