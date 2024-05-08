import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const RefreshButton = ({ refetch, isLoading }) => {
  return (
    <Button
      variant="outline-dark"
      className="btn-outline btn-active-secondary btn-icon-dark border-gray-400 w-100px px-2"
      size="sm"
      onClick={!isLoading && refetch}
    >
      <i
        className={'fa ' + (isLoading ? 'fa-repeat fa-spin' : 'fa-repeat')}
      ></i>
      {translate('Refresh')}
    </Button>
  );
};
