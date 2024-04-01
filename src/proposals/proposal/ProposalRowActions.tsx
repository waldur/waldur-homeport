import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

export const ProposalRowActions = ({ row }) => {
  const isStaff = useSelector(isStaffSelector);
  return isStaff ? (
    <Link
      state="proposal-create-review"
      params={{ proposal_uuid: row.uuid }}
      label={translate('Create review')}
      className="btn btn-primary"
    />
  ) : null;
};
