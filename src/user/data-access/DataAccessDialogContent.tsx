import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { User } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

import { fetchDataAccessVisibility } from './api';
import { DataAccessVisibility } from './DataAccessVisibility';

interface DataAccessDialogContentProps {
  user: User;
}

/**
 * Data access content for the UserDetailsDialog modal.
 * Shows full visibility with all 3 sections for staff/support.
 */
export const DataAccessDialogContent: FC<DataAccessDialogContentProps> = ({
  user,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['data-access-visibility', user.uuid],
    queryFn: () => fetchDataAccessVisibility(user.uuid),
    staleTime: 3 * 60 * 1000,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return <DataAccessVisibility data={data} isViewerStaffOrSupport={true} />;
};
