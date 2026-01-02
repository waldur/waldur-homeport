import { FC } from 'react';
import { userAgreementsDestroy } from 'waldur-js-client';

import { DeleteButton } from '@waldur/core/buttons';
import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';

const agreementTypeLabels = {
  PP: translate('Privacy policy'),
  TOS: translate('Terms of service'),
};

const getLanguageLabel = (code: string) => {
  if (!code) return translate('Default');
  const lang = ENV.languageChoices.find((l) => l.code === code);
  return lang?.label || code;
};

export const UserAgreementDeleteButton: FC<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const typeLabel =
    agreementTypeLabels[row.agreement_type] || row.agreement_type;
  const languageLabel = getLanguageLabel(row.language);

  return (
    <DeleteButton
      row={row}
      apiFunction={(r) => userAgreementsDestroy({ path: { uuid: r.uuid } })}
      refetch={refetch}
      confirmTitle={translate('Delete user agreement')}
      confirmMessage={translate(
        'Are you sure you would like to delete the {type} ({language})?',
        { type: typeLabel, language: languageLabel },
      )}
      successMessage={translate('User agreement has been deleted.')}
      errorMessage={translate('Unable to delete the user agreement.')}
    />
  );
};
