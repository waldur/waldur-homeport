import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

export const ProposalRowActions = ({ row }) => {
  const isStaff = useSelector(isStaffSelector);
  return (
    <>
      {isStaff ? (
        <Link
          state="proposal-create-review"
          params={{ proposal_uuid: row.uuid }}
          label={translate('Create review')}
          className="btn btn-primary me-2"
        />
      ) : null}
      <Link
        state="call-management.proposal-details"
        params={{ proposal_uuid: row.uuid }}
        className="btn btn-primary"
      >
        <span>{translate('View')}</span>
      </Link>
    </>
  );
};
