import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

export const EditGeneralInfoButton = () => {
  const callback = () => {
    // ignore
  };
  return (
    <ActionButton
      action={callback}
      title={translate('Edit')}
      icon="fa fa-pencil"
    />
  );
};
