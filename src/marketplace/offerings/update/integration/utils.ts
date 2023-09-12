import { translate } from '@waldur/i18n';

export const SCRIPT_ROWS = [
  { label: translate('Script language'), type: 'language' },
  {
    label: translate('Script for creation of a resource'),
    type: 'create',
    dry_run: 'Create',
  },
  {
    label: translate('Script for termination of a resource'),
    type: 'terminate',
    dry_run: 'Terminate',
  },
  {
    label: translate('Script for updating a resource on plan or limit change'),
    type: 'update',
    dry_run: 'Update',
  },
  {
    label: translate(
      'Script for regular update of resource and its accounting',
    ),
    type: 'pull',
    dry_run: 'Pull',
  },
];
