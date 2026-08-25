import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { callManagingOrganisationsList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { Badge } from '@/core/Badge';
import { SHORT_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import { AsyncSelectGroup, DateGroup, SelectGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { Field } from '@/resource/summary';
import { WizardModal, WizardStepProps } from '@/wizard';

const loadOrganizations = organizationAutocomplete({
  field: ['name', 'uuid', 'abbreviation'],
  o: 'name',
});

const getOrganizationValue = (option) => option.uuid;
const getOrganizationLabel = (option) => option.name;

/** Name, deadline, who runs the call and what it is priced against. */
export const OfferViaCallDetailsStep: FC<WizardStepProps> = (props) => {
  const { offering, planOptions } = props.data;
  const busy = props.submitting;

  // Which organisations are call managers already. Picking one of those adds
  // nothing to the deployment; picking any other quietly registers it, which
  // is a lasting change worth seeing before it is made rather than after.
  const { data: callManagerUuids } = useQuery({
    queryKey: ['OfferViaCallManagingOrganisations'],
    queryFn: () =>
      getAllPages<any>((page) =>
        callManagingOrganisationsList({
          query: { page, page_size: MAX_PAGE_SIZE },
        }),
      ).then((items) => new Set(items.map((item) => item.customer_uuid))),
    staleTime: SHORT_STALE_TIME,
  });

  const formatOrganization = useCallback(
    (option) => (
      <span>
        {option.name}
        {option.abbreviation && (
          <span className="text-muted ms-2">({option.abbreviation})</span>
        )}
        {callManagerUuids?.has(option.uuid) && (
          <Badge variant="info" pill outline className="ms-2">
            {translate('Call manager')}
          </Badge>
        )}
      </span>
    ),
    [callManagerUuids],
  );

  const options = useMemo(() => planOptions, [planOptions]);

  return (
    <WizardModal {...props}>
      <Field
        label={translate('Offering')}
        value={offering.name}
        labelCol={4}
        valueCol={8}
        space={2}
      />
      <div className="mt-7">
        <StringGroup
          name="name"
          label={translate('Call name')}
          required
          validate={required}
          disabled={busy}
        />
        <DateGroup
          name="cutoff_time"
          label={translate('Submission closes')}
          description={translate(
            'Requests are accepted until the end of this day.',
          )}
          required
          validate={required}
          disabled={busy}
        />
        <AsyncSelectGroup
          name="manager"
          label={translate('Call manager')}
          description={translate(
            'Organization that decides on the requests. Registered as a call manager if it is not one already.',
          )}
          placeholder={translate('Select organization...')}
          loadOptions={loadOrganizations}
          defaultOptions
          getOptionValue={getOrganizationValue}
          getOptionLabel={getOrganizationLabel}
          formatOptionLabel={formatOrganization}
          noOptionsMessage={() => translate('No organizations')}
          isClearable={false}
          required
          validate={required}
          isDisabled={busy}
        />
        <SelectGroup
          name="plan"
          label={translate('Plan')}
          description={translate('Requests are priced against this plan.')}
          options={options}
          required
          validate={required}
          isClearable={false}
          isDisabled={busy}
          spaceless
        />
      </div>
    </WizardModal>
  );
};
