import { FC } from 'react';
import { userAgreementsDestroy } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

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

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => userAgreementsDestroy({ path: { uuid: row.uuid } }),
    refetch,
    confirmation: {
      title: translate('Delete user agreement'),
      body: translate(
        'Are you sure you would like to delete the {type} ({language})?',
        { type: typeLabel, language: languageLabel },
      ),
      options: {
        forDeletion: true,
      },
    },
    successMessage: translate('User agreement has been deleted.'),
    errorMessage: translate('Unable to delete the user agreement.'),
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
