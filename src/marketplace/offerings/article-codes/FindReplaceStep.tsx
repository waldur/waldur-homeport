import { FC, useState, useMemo } from 'react';
import { useForm, useFormState } from 'react-final-form';
import {
  ArticleCodeUpdatePreviewRequest,
  marketplaceArticleCodeUpdatePreview,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, StringGroup } from '@/form';
import { Select, AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import {
  categoryAutocomplete,
  organizationAutocomplete,
} from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { OfferingStateOptions } from '@/table/generated/MarketplaceProviderOfferingsFilter';
import { WizardModal, WizardStepProps } from '@/wizard';

import type { ArticleCodeFormValues } from './types';

export const FindReplaceStep: FC<WizardStepProps> = (props) => {
  const form = useForm<ArticleCodeFormValues>();
  const { values } = useFormState<ArticleCodeFormValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useMemo(() => categoryAutocomplete(), []);
  const loadOrganizations = useMemo(() => organizationAutocomplete(), []);

  const previewAndContinue = async () => {
    setLoading(true);
    setError(null);
    try {
      const body: ArticleCodeUpdatePreviewRequest = {
        search: values.search?.trim(),
        replace: values.replace ?? '',
      };
      if (values.category) body.offering_category_uuid = values.category.uuid;
      if (values.customer) body.offering_customer_uuid = values.customer.uuid;
      if (values.offering_state)
        body.offering_state = values.offering_state.value;
      if (values.offering_name?.trim())
        body.offering_name = values.offering_name.trim();

      const response = await marketplaceArticleCodeUpdatePreview({
        body,
      });
      const results = response.data || [];
      if (results.length === 0) {
        setError(translate('No matching components found.'));
        return;
      }
      form.change('previewResults', results);
      props.handleSubmit();
    } catch (e: any) {
      setError(
        e.response?.data?.detail ||
          e.message ||
          translate('Failed to load preview'),
      );
    } finally {
      setLoading(false);
    }
  };

  const renderFooter = () => (
    <>
      <CloseDialogButton className="min-w-125px" />
      <SubmitButton
        submitting={loading}
        disabled={!values.search?.trim()}
        label={translate('Preview changes')}
        onClick={previewAndContinue}
        type="button"
      />
    </>
  );

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      <div className="row">
        <div className="col-sm-6">
          <StringGroup
            name="search"
            placeholder={translate('Substring to find...')}
            validate={required}
            label={translate('Find')}
            required
          />
        </div>
        <div className="col-sm-6">
          <StringGroup
            name="replace"
            placeholder={translate('Replacement...')}
            label={translate('Replace with')}
          />
        </div>
      </div>
      <FormGroup label={translate('Category')}>
        <AsyncSelect
          placeholder={translate('All categories')}
          value={values.category}
          loadOptions={loadCategories}
          getOptionLabel={(option) => option.title}
          getOptionValue={(option) => option.uuid}
          onChange={(val) => form.change('category', val)}
          isClearable
        />
      </FormGroup>
      <FormGroup label={translate('Service provider')}>
        <AsyncSelect
          placeholder={translate('All providers')}
          value={values.customer}
          loadOptions={loadOrganizations}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.uuid}
          onChange={(val) => form.change('customer', val)}
          isClearable
        />
      </FormGroup>
      <div className="row">
        <div className="col-sm-6">
          <FormGroup label={translate('Offering state')}>
            <Select
              placeholder={translate('All states')}
              value={values.offering_state}
              options={OfferingStateOptions}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => String(option.value)}
              onChange={(val) => form.change('offering_state', val)}
              isClearable
            />
          </FormGroup>
        </div>
        <div className="col-sm-6">
          <StringGroup
            name="offering_name"
            placeholder={translate('Filter by name...')}
            label={translate('Offering name')}
          />
        </div>
      </div>
      {error && <div className="alert alert-warning mb-0 mt-4">{error}</div>}
    </WizardModal>
  );
};
