import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getOfferingPermissions } from '@waldur/customer/team/api';
import { translate } from '@waldur/i18n';

export const OfferingNamesManagedByUser: FunctionComponent<{
  userUuid: string;
}> = ({ userUuid }) => {
  const { loading, error, value: offerings } = useAsync(() =>
    getOfferingPermissions(userUuid),
  );
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load data')}</>
  ) : (
    <>
      {offerings.map(({ offering_name }, index) => (
        <span key={index}>
          {offering_name}
          {index !== offerings.length - 1 ? ', ' : ''}
        </span>
      ))}
    </>
  );
};
