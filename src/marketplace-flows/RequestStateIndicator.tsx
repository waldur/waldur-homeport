import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';

const getLabel = (state) =>
  ({
    draft: translate('Draft'),
    pending: translate('Pending'),
    approved: translate('Approved'),
    rejected: translate('Rejected'),
    canceled: translate('Canceled'),
  }[state]);

const LABEL_CLASSES = {
  draft: 'plain',
  pending: 'info',
  approved: 'success',
  rejected: 'warning',
  canceled: 'plain',
};

export const RequestStateIndicator = ({ row }) => (
  <StateIndicator
    label={getLabel(row.state)}
    variant={LABEL_CLASSES[row.state] || 'info'}
    active={row.state === 'pending'}
  />
);
