import { translate } from '@waldur/i18n';

export function getMessage({ query, verboseName }) {
  const context = {verboseName: verboseName || translate('items')};
  if (query && query !== '') {
    return translate('There are no {verboseName} found matching the filter.', context);
  } else {
    return translate('There are no {verboseName} yet.', context);
  }
}
