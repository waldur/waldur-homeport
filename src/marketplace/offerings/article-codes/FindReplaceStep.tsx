import { FC, useState } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';
import { marketplaceArticleCodeUpdatePreview } from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton } from '@/form';
import { StringField } from '@/form';
import { AsyncPaginate } from '@/form/themed-select';
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

  const previewAndContinue = async () => {
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
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
        body: body as any,
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
          <FormGroup label={translate('Find')} required>
            <Field
              name="search"
              component={StringField}
              placeholder={translate('Substring to find...')}
              validate={required}
            />
          </FormGroup>
        </div>
        <div className="col-sm-6">
          <FormGroup label={translate('Replace with')}>
            <Field
              name="replace"
              component={StringField}
              placeholder={translate('Replacement...')}
            />
          </FormGroup>
        </div>
      </div>

      <FormGroup label={translate('Category')}>
        <AsyncPaginate
          placeholder={translate('All categories')}
          value={values.category}
          loadOptions={categoryAutocomplete}
          getOptionLabel={(option) => option.title}
          getOptionValue={(option) => option.uuid}
          onChange={(val) => form.change('category', val)}
          isClearable
        />
      </FormGroup>

      <FormGroup label={translate('Service provider')}>
        <AsyncPaginate
          placeholder={translate('All providers')}
          value={values.customer}
          loadOptions={organizationAutocomplete}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.uuid}
          onChange={(val) => form.change('customer', val)}
          isClearable
        />
      </FormGroup>

      <div className="row">
        <div className="col-sm-6">
          <FormGroup label={translate('Offering state')}>
            <AsyncPaginate
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
          <FormGroup label={translate('Offering name')}>
            <Field
              name="offering_name"
              component={StringField}
              placeholder={translate('Filter by name...')}
            />
          </FormGroup>
        </div>
      </div>

      {error && <div className="alert alert-warning mb-0 mt-4">{error}</div>}
    </WizardModal>
  );
};
