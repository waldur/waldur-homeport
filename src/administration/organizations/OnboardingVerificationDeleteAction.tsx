import { onboardingVerificationsDestroy } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { translate, formatJsxTemplate } from '@/i18n';

export const OnboardingVerificationDeleteAction = (props) => (
  <DeleteButton
    row={props.row}
    apiFunction={(r) =>
      onboardingVerificationsDestroy({ path: { uuid: r.uuid } })
    }
    refetch={props.refetch}
    confirmTitle={translate('Confirmation')}
    confirmMessage={(r) =>
      translate(
        'Are you sure you want to delete the verification entry for {name}?',
        {
          name: <strong>{r.verified_company_data.name || r.legal_name}</strong>,
        },
        formatJsxTemplate,
      )
    }
    successMessage={translate('Verification entry removed successfully.')}
    errorMessage={translate('Unable to remove verification entry.')}
    title={translate('Remove')}
  />
);
