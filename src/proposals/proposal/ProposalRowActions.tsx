import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

export const ProposalRowActions = ({ row }) => (
  <Link
    state="proposal-create-review"
    params={{ proposal_uuid: row.uuid }}
    label={translate('Create review')}
    className="btn btn-primary"
  />
);
