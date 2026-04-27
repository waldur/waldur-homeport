import { proposalReviewsDestroy } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { formatJsxTemplate, translate } from '@/i18n';

export const ReviewDeleteAction = (props) => (
  <DeleteButton
    row={props.row}
    apiFunction={(r) => proposalReviewsDestroy({ path: { uuid: r.uuid } })}
    refetch={props.refetch}
    confirmTitle={translate('Confirmation')}
    confirmMessage={(r) =>
      translate(
        'Are you sure you want to delete the review for proposal {proposal_name}?',
        { proposal_name: <strong>{r.proposal_name}</strong> },
        formatJsxTemplate,
      )
    }
    successMessage={translate('Review removed successfully.')}
    errorMessage={translate('Unable to remove review.')}
    title={translate('Remove')}
  />
);
