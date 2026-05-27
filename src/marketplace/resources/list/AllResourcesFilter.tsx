import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { NestedColumn } from 'waldur-js-client';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { StringField } from '@/form';
import { translate } from '@/i18n';
import { OfferingAutocomplete } from '@/marketplace/offerings/details/OfferingAutocomplete';
import { parentOfferingFilter } from '@/marketplace/offerings/utils';
import { OrganizationAutocomplete } from '@/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@/table/TableFilterItem';

import { OfferingFilter } from './OfferingFilter';
import { ProjectFilter } from './ProjectFilter';
import { ResourceStateFilter } from './ResourceStateFilter';
import { RuntimeStateFilter } from './RuntimeStateFilter';

export const AllResourcesFilter: FunctionComponent<{
  category_uuid?: string;
  columns?: NestedColumn[];
}> = ({ category_uuid, columns }) => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
    >
      <OrganizationAutocomplete reactSelectProps={{ variant: 'tableFilter' }} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Project')}
      name="project"
      badgeValue={(value) => value?.name}
    >
      <ProjectFilter reactSelectProps={{ variant: 'tableFilter' }} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      badgeValue={(value) => value?.name}
    >
      <OfferingFilter category_uuid={category_uuid} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Parent offering')}
      name="parent_offering"
      badgeValue={(value) => value?.name}
    >
      <OfferingAutocomplete
        reactSelectProps={{ variant: 'tableFilter' }}
        name="parent_offering"
        offeringFilter={parentOfferingFilter}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Runtime state')}
      name="runtime_state"
      badgeValue={(value) => value?.label}
    >
      <RuntimeStateFilter />
    </TableFilterItem>
    {columns?.some((column) => column.attribute === 'flavor_name') && (
      <TableFilterItem
        title={translate('Flavor name')}
        name="flavor_name"
        badgeValue={(value) => value}
      >
        <Field
          name="flavor_name"
          component={StringField}
          placeholder={translate('Flavor name...')}
        />
      </TableFilterItem>
    )}
    {columns?.some((column) => column.attribute === 'image_name') && (
      <TableFilterItem
        title={translate('Image name')}
        name="image_name"
        badgeValue={(value) => value}
      >
        <Field
          name="image_name"
          component={StringField}
          placeholder={translate('Image name...')}
        />
      </TableFilterItem>
    )}
    <TableFilterItem
      title={translate('State')}
      name="state"
      instantApply={false}
    >
      <ResourceStateFilter />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Include terminated')}
      name="include_terminated"
      badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      ellipsis={false}
    >
      <Field
        name="include_terminated"
        component={(fieldProps) => (
          <AwesomeCheckbox
            label={translate('Include terminated')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Exclude attached')}
      name="exclude_attached"
      badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      ellipsis={false}
    >
      <Field
        name="exclude_attached"
        component={(fieldProps) => (
          <AwesomeCheckbox
            label={translate('Exclude attached')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Paused')}
      name="paused"
      badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      ellipsis={false}
    >
      <Field
        name="paused"
        component={(fieldProps) => (
          <AwesomeCheckbox
            label={translate('Paused')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Downscaled')}
      name="downscaled"
      badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      ellipsis={false}
    >
      <Field
        name="downscaled"
        component={(fieldProps) => (
          <AwesomeCheckbox
            label={translate('Downscaled')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Restrict member access')}
      name="restrict_member_access"
      badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      ellipsis={false}
    >
      <Field
        name="restrict_member_access"
        component={(fieldProps) => (
          <AwesomeCheckbox
            label={translate('Restrict member access')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
          />
        )}
      />
    </TableFilterItem>
  </>
);
