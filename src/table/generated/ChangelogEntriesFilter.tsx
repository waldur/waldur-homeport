// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  ChangelogEntriesRetrieveData,
  ChangelogEntryListCategoryEnum,
  ChangelogEntryListRiskEnum,
  ChangelogEntryListTypeEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const ChangelogEntryListCategoryOptions: ChangelogEntryListCategoryOption[] =
  [
    {
      label: translate('AI assistant'),
      value: 'ai_assistant',
    },
    {
      label: translate('Authentication'),
      value: 'auth',
    },
    {
      label: translate('Identity'),
      value: 'identity',
    },
    {
      label: translate('Infrastructure'),
      value: 'infrastructure',
    },
    {
      label: translate('Invoices'),
      value: 'invoices',
    },
    {
      label: translate('Marketplace'),
      value: 'marketplace',
    },
    {
      label: translate('Notifications'),
      value: 'notifications',
    },
    {
      label: translate('OpenStack'),
      value: 'openstack',
    },
    {
      label: translate('Policy'),
      value: 'policy',
    },
    {
      label: translate('Proposals'),
      value: 'proposal',
    },
    {
      label: translate('Reporting'),
      value: 'reporting',
    },
    {
      label: translate('SLURM'),
      value: 'slurm',
    },
    {
      label: translate('Support'),
      value: 'support',
    },
    {
      label: translate('UI'),
      value: 'ui',
    },
  ];
export interface ChangelogEntryListCategoryOption {
  label: string;
  value: ChangelogEntryListCategoryEnum;
}

export const ChangelogEntryListRiskOptions: ChangelogEntryListRiskOption[] = [
  {
    label: translate('High'),
    value: 'high',
  },
  {
    label: translate('Low'),
    value: 'low',
  },
  {
    label: translate('Medium'),
    value: 'medium',
  },
  {
    label: translate('None'),
    value: 'none',
  },
];
export interface ChangelogEntryListRiskOption {
  label: string;
  value: ChangelogEntryListRiskEnum;
}

export const ChangelogEntryListTypeOptions: ChangelogEntryListTypeOption[] = [
  {
    label: translate('Breaking'),
    value: 'breaking',
  },
  {
    label: translate('Deprecation'),
    value: 'deprecation',
  },
  {
    label: translate('Feature'),
    value: 'feature',
  },
  {
    label: translate('Fix'),
    value: 'fix',
  },
  {
    label: translate('Improvement'),
    value: 'improvement',
  },
  {
    label: translate('Security'),
    value: 'security',
  },
];
export interface ChangelogEntryListTypeOption {
  label: string;
  value: ChangelogEntryListTypeEnum;
}

export const RelevantOnlyOptions: RelevantOnlyOption[] = [
  {
    label: translate('Applies to this deployment'),
    value: true,
  },
];
export interface RelevantOnlyOption {
  label: string;
  value: boolean;
}

export const ChangelogEntriesFilter: FunctionComponent<{}> = () => (
  <>
    <SelectFilter
      title={translate('Relevance')}
      name="relevant_only"
      getValueLabel={(value: RelevantOnlyOption) => value?.label}
      options={RelevantOnlyOptions}
      getOptionValue={(option: RelevantOnlyOption) => String(option.value)}
      getOptionLabel={(option: RelevantOnlyOption) => option.label}
      isClearable={true}
      placeholder={translate('All entries')}
    />
    <SelectFilter
      title={translate('Type')}
      name="type"
      getValueLabel={(value: ChangelogEntryListTypeOption) => value?.label}
      options={ChangelogEntryListTypeOptions}
      getOptionValue={(option: ChangelogEntryListTypeOption) =>
        String(option.value)
      }
      getOptionLabel={(option: ChangelogEntryListTypeOption) => option.label}
      isClearable={true}
      placeholder={translate('Type')}
    />
    <SelectFilter
      title={translate('Risk')}
      name="risk"
      getValueLabel={(value: ChangelogEntryListRiskOption) => value?.label}
      options={ChangelogEntryListRiskOptions}
      getOptionValue={(option: ChangelogEntryListRiskOption) =>
        String(option.value)
      }
      getOptionLabel={(option: ChangelogEntryListRiskOption) => option.label}
      isClearable={true}
      placeholder={translate('Risk')}
    />
    <SelectFilter
      title={translate('Category')}
      name="category"
      getValueLabel={(value: ChangelogEntryListCategoryOption) => value?.label}
      options={ChangelogEntryListCategoryOptions}
      getOptionValue={(option: ChangelogEntryListCategoryOption) =>
        String(option.value)
      }
      getOptionLabel={(option: ChangelogEntryListCategoryOption) =>
        option.label
      }
      isClearable={true}
      placeholder={translate('Category')}
    />
  </>
);

export const ChangelogEntriesFilterFormId = 'ChangelogEntriesFilter';

export interface ChangelogEntriesFilterFormData {
  relevant_only: RelevantOnlyOption;
  type: ChangelogEntryListTypeOption;
  risk: ChangelogEntryListRiskOption;
  category: ChangelogEntryListCategoryOption;
}

type ChangelogEntriesFilterQuery = ChangelogEntriesRetrieveData['query'];

export const selectChangelogEntriesFilter = (
  values?: Partial<ChangelogEntriesFilterFormData>,
): ChangelogEntriesFilterQuery => {
  const filter: ChangelogEntriesFilterQuery = {} as any;
  if (values) {
    if (values.relevant_only) {
      filter.relevant_only = values.relevant_only.value;
    }
    if (values.type) {
      filter.type = values.type.value;
    }
    if (values.risk) {
      filter.risk = values.risk.value;
    }
    if (values.category) {
      filter.category = values.category.value;
    }
  }
  return filter;
};
