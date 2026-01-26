import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';

import { fetchCustomerProjects } from '@waldur/customer/workspace/fetchCustomer';
import { WizardModal, WizardStepProps } from '@waldur/wizard';
import { Customer } from '@waldur/workspace/types';

import { CreditGroup } from './CreditGroup';
import { DescriptionGroup } from './DescriptionGroup';
import { EndDateGroup } from './EndDateGroup';
import { ImageGroup } from './ImageGroup';
import { IndustryGroup } from './IndustryGroup';
import { KindGroup } from './KindGroup';
import { NameGroup } from './NameGroup';
import { OecdCodeGroup } from './OecdCodeGroup';
import { OrganizationGroup } from './OrganizationGroup';
import { SlugGroup } from './SlugGroup';
import { StartDateGroup } from './StartDateGroup';
import { TypeGroup } from './TypeGroup';

export const Step1ProjectInfo: FC<WizardStepProps> = (props) => {
  const initialCustomer = props.data.initialCustomer;
  const selectedCustomer = props.data.selectedCustomer as Customer;
  const setSelectedCustomer = props.data.setSelectedCustomer as React.Dispatch<
    React.SetStateAction<Customer>
  >;

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
    staleTime: 5 * 60 * 1000,
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
      <SlugGroup />
      <DescriptionGroup create />
      <IndustryGroup />
      <OecdCodeGroup />
      <KindGroup create />

      <TypeGroup create />
      <StartDateGroup create />
      <EndDateGroup create />
      <CreditGroup customer={props.values?.customer} />
      <ImageGroup create />
    </WizardModal>
  );
};
