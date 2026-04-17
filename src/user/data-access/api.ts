import { usersDataAccessRetrieve } from 'waldur-js-client';

import { DataAccessVisibility } from './types';

// Fetch data access visibility (who CAN access)
export const fetchDataAccessVisibility = async (
  userUuid: string,
): Promise<DataAccessVisibility> => {
  const response = await usersDataAccessRetrieve({
    path: { uuid: userUuid },
  });
  return response.data as DataAccessVisibility;
};
