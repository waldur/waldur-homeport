import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';

import { STALE_TIME } from '@/core/constants';
import { fetchCustomerProjects } from '@/customer/workspace/fetchCustomer';
import { WizardModal, WizardStepProps } from '@/wizard';
import { useUser } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

import { AffiliationGroup } from './AffiliationGroup';
import { CreditGroup } from './CreditGroup';
import { DescriptionGroup } from './DescriptionGroup';
import { EndDateGroup } from './EndDateGroup';
import { ImageGroup } from './ImageGroup';
import { IndustryGroup } from './IndustryGroup';
import { KindGroup } from './KindGroup';
import { NameGroup } from './NameGroup';
import { OecdCodeGroup } from './OecdCodeGroup';
import { OrganizationGroup } from './OrganizationGroup';
import { ScienceDomainGroup } from './ScienceDomainGroup';
import { SlugGroup } from './SlugGroup';
import { StartDateGroup } from './StartDateGroup';
import { TypeGroup } from './TypeGroup';

export const Step1ProjectInfo: FC<WizardStepProps> = (props) => {
  const initialCustomer = props.data.initialCustomer;
  const selectedCustomer = props.data.selectedCustomer as Customer;
  const setSelectedCustomer = props.data.setSelectedCustomer as React.Dispatch<
    React.SetStateAction<Customer>
  >;
  const user = useUser();
  const isStaff = Boolean(user?.is_staff);

  // Fetch customer projects
  const {
    data: projects,
    isLoading,
    error,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ['CustomerProjects', selectedCustomer?.uuid],
    queryFn: () =>
      !selectedCustomer
        ? null
        : selectedCustomer?.projects
          ? Promise.resolve(selectedCustomer.projects)
          : fetchCustomerProjects(selectedCustomer.uuid),
    staleTime: STALE_TIME,
  });

  const customer = useMemo(() => {
    const _customer = selectedCustomer || initialCustomer || {};
    return _customer ? { ..._customer, projects } : undefined;
  }, [selectedCustomer, projects, initialCustomer]);

  return (
    <WizardModal {...props} loading={isLoading}>
      <OrganizationGroup
        onChange={setSelectedCustomer}
        isDisabled={!!initialCustomer}
      />
      <NameGroup
        customer={customer}
        loading={isLoading}
        error={error}
        refetch={refetchProjects}
      />
      <SlugGroup customer={customer} />
      <DescriptionGroup create />
      <IndustryGroup />
      <OecdCodeGroup />
      <ScienceDomainGroup />
      <AffiliationGroup customer={customer as Customer} isStaff={isStaff} />
      <KindGroup create />

      <TypeGroup create />
      <StartDateGroup create />
      <EndDateGroup create />
      <CreditGroup customer={props.values?.customer} />
      <ImageGroup create />
    </WizardModal>
  );
};
