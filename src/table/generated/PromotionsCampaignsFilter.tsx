// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  CampaignStateEnum,
  DiscountTypeEnum,
  PromotionsCampaignsListData,
} from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const CampaignStateOptions: CampaignStateOption[] = [
  {
    label: translate('Active'),
    value: 'Active',
  },
  {
    label: translate('Draft'),
    value: 'Draft',
  },
  {
    label: translate('Terminated'),
    value: 'Terminated',
  },
];
export interface CampaignStateOption {
  label: string;
  value: CampaignStateEnum;
}

export const DiscountTypeOptions: DiscountTypeOption[] = [
  {
    value: 'discount',
    label: translate('Discount'),
  },
  {
    value: 'special_price',
    label: translate('Special price'),
  },
];
export interface DiscountTypeOption {
  label: string;
  value: DiscountTypeEnum;
}

const PurePromotionsCampaignsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('State')}
      name="state"
      getValueLabel={(value: CampaignStateOption) => value?.label}
    >
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('State')}
            options={CampaignStateOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: CampaignStateOption) =>
              String(option.value)
            }
            getOptionLabel={(option: CampaignStateOption) => option.label}
            isClearable={true}
            isMulti={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Discount type')}
      name="discount_type"
      getValueLabel={(value: DiscountTypeOption) => value?.label}
    >
      <Field
        name="discount_type"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Discount type')}
            options={DiscountTypeOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: DiscountTypeOption) =>
              String(option.value)
            }
            getOptionLabel={(option: DiscountTypeOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const PromotionsCampaignsFilterFormId = 'PromotionsCampaignsFilter';

interface PromotionsCampaignsFilterFormData {
  state: CampaignStateOption[];
  discount_type: DiscountTypeOption;
}

export const PromotionsCampaignsFilter = reduxForm<
  PromotionsCampaignsFilterFormData,
  {}
>({
  form: PromotionsCampaignsFilterFormId,
  destroyOnUnmount: false,
})(PurePromotionsCampaignsFilter);

type PromotionsCampaignsFilterQuery = PromotionsCampaignsListData['query'];

export const selectPromotionsCampaignsFilter = createSelector<
  RootState,
  Partial<PromotionsCampaignsFilterFormData>,
  PromotionsCampaignsFilterQuery
>(getFormValues(PromotionsCampaignsFilterFormId), (values) => {
  const filter: PromotionsCampaignsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
    if (values.discount_type) {
      filter.discount_type = values.discount_type.value;
    }
  }
  return filter;
});
