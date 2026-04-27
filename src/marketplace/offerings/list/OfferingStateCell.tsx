import { translate } from '@/i18n';

export const OfferingStateCell = ({ row }) =>
  ({
    Draft: translate('Draft'),
    Active: translate('Active'),
    Paused: translate('Paused'),
    Archived: translate('Archived'),
    Unavailable: translate('Unavailable'),
  })[row.state] || row.state;
