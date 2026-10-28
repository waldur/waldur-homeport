import { useQuery } from '@tanstack/react-query';
import { marketplaceOfferingPermissionsList } from 'waldur-js-client';

import { FormField, FormLabel } from 'waldur-ui';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SymbolsGroup } from '@/customer/dashboard/SymbolsGroup';
import { translate } from '@/i18n';
import { Customer } from '@/workspace/types';

export const ProviderOfferingPermissions = ({
  customer,
}: {
  customer: Customer;
}) => {
  const {
    isLoading: loading,
    error,
    data: offeringPermissions,
  } = useQuery({
    queryKey: ['ProviderOfferingPermissions', customer],

    queryFn: () =>
      getAllPages((page) =>
        marketplaceOfferingPermissionsList({
          query: { page, page_size: MAX_PAGE_SIZE, customer: customer.uuid },
        }),
      ),
  });

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load users')}</>
  ) : (
    offeringPermissions &&
    offeringPermissions.length > 0 && (
      <FormField className="flex flex-wrap gap-x-5">
        <FormLabel className="flex-none mb-0 py-[10px]">
          {translate('Offering managers:')}
        </FormLabel>
        <div className="flex-1 min-w-0">
          <SymbolsGroup
            items={offeringPermissions}
            max={6}
            nameKey="user_full_name"
            emailKey="user_email"
          />
        </div>
      </FormField>
    )
  );
};
