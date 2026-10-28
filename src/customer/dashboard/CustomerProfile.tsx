import {
  AtIcon,
  DeviceMobileIcon,
  HexagonIcon,
  HashIcon,
} from '@phosphor-icons/react';

import { formatPhoneNumber } from '@/core/utils';
import { PublicDashboardHero } from '@/dashboard/hero/PublicDashboardHero';
import { CountryFlag } from '@/marketplace/common/CountryFlag';
import { ProviderOfferingPermissions } from '@/marketplace/service-providers/dashboard/ProviderOfferingPermissions';
import { getItemAbbreviation } from '@/navigation/workspace/context-selector/utils';
import { Customer } from '@/workspace/types';

import { CustomerActions } from './CustomerActions';

interface CustomerProfileProps {
  customer: Customer;
  fromServiceProvider?: boolean;
}

export const CustomerProfile = ({
  customer,
  fromServiceProvider,
}: CustomerProfileProps) => (
  <PublicDashboardHero
    hideQuickSection
    logo={customer.image}
    logoAlt={getItemAbbreviation(customer)}
    logoCircle
    cardBordered
    title={
      <div>
        <div className="flex items-center self-stretch gap-3 text-quaternary mb-2.5">
          {customer.country && (
            <CountryFlag
              countryCode={customer.country}
              fontSize={22}
              className="h-[25px]"
            />
          )}
          <h3 className="mb-0">{customer.name}</h3>
        </div>
        <div className="flex items-center self-stretch gap-4 flex-wrap text-quaternary leading-none">
          {customer.organization_groups?.length > 0 && (
            <span className="whitespace-nowrap">
              <HexagonIcon size={18} weight="duotone" className="me-1" />
              {customer.organization_groups
                ?.map((group) => group.name)
                .join(', ')}
            </span>
          )}
          {customer.email && (
            <span className="whitespace-nowrap">
              <AtIcon size={18} weight="duotone" className="me-1" />
              {customer.email}
            </span>
          )}
          {customer.phone_number && (
            <span className="whitespace-nowrap">
              <DeviceMobileIcon size={18} weight="duotone" className="me-1" />
              {formatPhoneNumber(customer.phone_number)}
            </span>
          )}
          {customer.registration_code &&
            typeof customer.registration_code === 'string' && (
              <span className="whitespace-nowrap">
                <HashIcon size={18} weight="duotone" className="me-1" />
                {customer.registration_code}
              </span>
            )}
        </div>
      </div>
    }
    actions={<CustomerActions customer={customer} />}
  >
    {fromServiceProvider ? (
      <div>
        <ProviderOfferingPermissions customer={customer} />
      </div>
    ) : null}
  </PublicDashboardHero>
);
