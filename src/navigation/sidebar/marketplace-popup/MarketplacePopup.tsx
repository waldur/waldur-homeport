import { debounce } from 'es-toolkit';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Form, useForm, useFormState } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import { Project } from 'waldur-js-client';

import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { setMarketplaceFilter } from '@/marketplace/landing/filter/store/actions';
import { OrganizationAutocomplete } from '@/marketplace/orders/OrganizationAutocomplete';
import { ProjectAutocomplete } from '@/marketplace/resources/list/ProjectAutocomplete';
import { ModalDialog } from '@/modal/ModalDialog';
import { Customer } from '@/workspace/types';

import { sidebarResourcesFilterSelector } from '../resources-filter/utils';

import { DataLoader } from './DataLoader';

interface MarketplacePopupProps {
  resolve?: {
    organization?: Customer;
    project?: Project;
    categoryUuid?: string;
  };
}

interface FormData {
  organization?: Pick<Customer, 'name' | 'uuid' | 'abbreviation'>;
  project?: Pick<
    Project,
    'name' | 'uuid' | 'url' | 'customer_uuid' | 'is_industry'
  >;
}

const MarketplacePopupForm: FC<{ categoryUuid?: string }> = ({
  categoryUuid,
}) => {
  const [filter, setFilter] = useState('');
  const dispatch = useDispatch();
  const form = useForm();
  const { values } = useFormState<FormData>();

  const organization = values?.organization;
  const project = values?.project;
  const organizationUuid = organization?.uuid;
  const projectCustomerUuid = project?.customer_uuid;

  // Clear project filter if organization is cleared or changed
  useEffect(() => {
    if (!project || !organization) return;
    if (organizationUuid !== projectCustomerUuid) {
      form.change('project', undefined);
    }
  }, [organizationUuid, projectCustomerUuid, project, organization, form]);

  useEffect(() => {
    dispatch(
      setMarketplaceFilter({
        name: 'organization',
        value: organization,
      }),
    );
    dispatch(setMarketplaceFilter({ name: 'project', value: project }));
  }, [organization, project, dispatch]);

  const applyQuery = useCallback(
    debounce((value) => {
      setFilter(String(value).trim());
    }, 500),
    [],
  );

  return (
    <ModalDialog
      title={translate('Add resource')}
      subtitle={translate(
        'Select an organization and project, then choose a category, an offering, and follow the prompts',
      )}
      headerClassName="pb-3"
      bodyClassName="p-0 pb-3"
    >
      <div className="px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 mb-3">
          <div className="mb-3 lg:mb-0">
            <OrganizationAutocomplete
              placeholder={translate('Select an organization')}
            />
          </div>
          <div>
            <ProjectAutocomplete
              customer_uuid={values?.organization?.uuid}
              isDisabled={!values?.organization?.uuid}
              placeholder={translate('Select a project')}
            />
          </div>
        </div>
        <div className="mb-3">
          <FilterBox
            id="marketplaces-selector-search-box"
            type="search"
            placeholder={translate('Search an offering')}
            onChange={(e) => applyQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <div className="border-b border-secondary mx-6" />
      <DataLoader
        filter={filter}
        customer={values?.organization}
        project={values?.project}
        categoryUuid={categoryUuid}
      />
    </ModalDialog>
  );
};

export const MarketplacePopup: FC<MarketplacePopupProps> = (props) => {
  const sidebarResourcesFilters = useSelector(sidebarResourcesFilterSelector);

  const initialValues = useMemo(() => {
    const preferredFilter =
      props.resolve?.organization || props.resolve?.project
        ? props.resolve
        : sidebarResourcesFilters;

    return {
      organization: preferredFilter?.organization,
      project: preferredFilter?.project,
    };
  }, [props.resolve, sidebarResourcesFilters]);

  return (
    <Form<FormData>
      onSubmit={() => {}}
      initialValues={initialValues}
      render={() => (
        <MarketplacePopupForm categoryUuid={props.resolve?.categoryUuid} />
      )}
    />
  );
};
