import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-final-form';
import { scienceDomainsList, scienceSubDomainsList } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { SelectField, SelectGroup } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';

interface ScienceDomainGroupProps {
  // Preselects the parent domain when the form already holds a sub-domain, so
  // an edit form opens with its sub-domain list loaded rather than disabled.
  initialDomain?: { uuid: string; name: string } | null;
  // Marks the sub-domain as mandatory. The parent domain is a navigation aid
  // for picking one, so only the sub-domain carries the asterisk.
  required?: boolean;
  // Shows the selector whatever the project.science_domain feature says, for
  // a caller that has decided that itself: the proposal form, through
  // getFieldStates, shows a science domain its call requires.
  alwaysShown?: boolean;
}

export const ScienceDomainGroup = ({
  initialDomain = null,
  required = false,
  alwaysShown = false,
}: ScienceDomainGroupProps = {}) => {
  const form = useForm();
  const [domains, setDomains] = useState([]);
  const [subDomains, setSubDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(initialDomain);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [loadingSubDomains, setLoadingSubDomains] = useState(false);

  const shown = alwaysShown || isFeatureVisible(ProjectFeatures.science_domain);

  useEffect(() => {
    if (!shown) {
      setLoadingDomains(false);
      return;
    }
    let cancelled = false;
    scienceDomainsList({ query: { page_size: 100 } })
      .then(({ data }) => {
        if (!cancelled) {
          setDomains(data);
        }
      })
      .catch(() => {
        // As for sub-domains below: an empty select, not an unhandled
        // rejection and a spinner that never stops.
        if (!cancelled) {
          setDomains([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingDomains(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [shown]);

  // Loading is keyed on the selected domain rather than done inside the change
  // handler, so a domain preselected from an existing value loads its
  // sub-domains on mount too.
  useEffect(() => {
    if (!shown || !selectedDomain) {
      setSubDomains([]);
      return;
    }
    let cancelled = false;
    setLoadingSubDomains(true);
    scienceSubDomainsList({
      query: { domain_uuid: selectedDomain.uuid, page_size: 100 },
    })
      .then(({ data }) => {
        if (!cancelled) {
          setSubDomains(data);
        }
      })
      .catch(() => {
        // A failed lookup leaves the sub-domain select empty rather than
        // rejecting unhandled; the domain stays selected so the user can retry
        // by reselecting it.
        if (!cancelled) {
          setSubDomains([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingSubDomains(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [shown, selectedDomain]);

  const handleDomainChange = useCallback(
    (option) => {
      setSelectedDomain(option);
      form.change('science_sub_domain', null);
    },
    [form],
  );

  if (!shown) {
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
      <SelectGroup
        name="science_sub_domain"
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
        label={translate('Science sub-domain')}
        required={required}
      />
    </>
  );
};
