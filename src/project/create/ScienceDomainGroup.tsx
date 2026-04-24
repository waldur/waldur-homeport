import { useCallback, useEffect, useState } from 'react';
import { Field, useForm } from 'react-final-form';
import { scienceDomainsList, scienceSubDomainsList } from 'waldur-js-client';

import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ScienceDomainGroup = () => {
  const form = useForm();
  const [domains, setDomains] = useState([]);
  const [subDomains, setSubDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [loadingSubDomains, setLoadingSubDomains] = useState(false);

  const featureVisible = isFeatureVisible(ProjectFeatures.science_domain);

  useEffect(() => {
    if (!featureVisible) {
      setLoadingDomains(false);
      return;
    }
    let cancelled = false;
    scienceDomainsList({ query: { page_size: 100 } }).then(({ data }) => {
      if (!cancelled) {
        setDomains(data);
        setLoadingDomains(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [featureVisible]);

  const handleDomainChange = useCallback(
    async (option) => {
      setSelectedDomain(option);
      form.change('science_sub_domain', null);
      setSubDomains([]);
      if (option) {
        setLoadingSubDomains(true);
        try {
          const { data } = await scienceSubDomainsList({
            query: { domain_uuid: option.uuid, page_size: 100 },
          });
          setSubDomains(data);
        } finally {
          setLoadingSubDomains(false);
        }
      }
    },
    [form],
  );

  if (!featureVisible) {
    return null;
  }

  return (
    <>
      <FormGroup label={translate('Science domain')}>
        <SelectField
          input={{
            value: selectedDomain,
            onChange: handleDomainChange,
            onBlur: () => {},
            name: '_science_domain',
          }}
          meta={{}}
          options={domains}
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          isClearable={true}
          isLoading={loadingDomains}
          placeholder={translate('Select science domain...')}
        />
      </FormGroup>
      <FormGroup label={translate('Science sub-domain')}>
        <Field
          name="science_sub_domain"
          component={SelectField}
          options={subDomains}
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          isClearable={true}
          isLoading={loadingSubDomains}
          isDisabled={!selectedDomain}
          placeholder={
            selectedDomain
              ? translate('Select sub-domain...')
              : translate('Select a domain first')
          }
        />
      </FormGroup>
    </>
  );
};
