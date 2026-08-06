import { useQuery } from '@tanstack/react-query';
import { Form } from 'react-bootstrap';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

interface AccessSubnetScopeFieldsProps {
  customerUuid: string;
  appliesToPortal: boolean;
  offerings: string[];
  onChange: (name: string, value: any) => void;
}

/**
 * What a trusted network is trusted for, as edited for a single address.
 *
 * The grid is the place to change many addresses at once; this is the place to
 * finish one — set its scope while you are already editing its CIDR and
 * description, without a second trip through change mode.
 */
export const AccessSubnetScopeFields = ({
  customerUuid,
  appliesToPortal,
  offerings,
  onChange,
}: AccessSubnetScopeFieldsProps) => {
  // Only offerings the organization consumes and that accept access subnets —
  // the same pair of conditions the backend enforces, so nothing offered here
  // can fail on save.
  //
  // The *public* endpoint, not the provider one: this list is read by the
  // consuming organization, and marketplace-provider-offerings is scoped to
  // offerings the caller publishes, so it returns nothing at all to a consumer
  // — leaving every column empty for exactly the users this feature is for.
  const { data, isLoading } = useQuery({
    queryKey: ['consumed-offerings', customerUuid],
    queryFn: () =>
      marketplacePublicOfferingsList({
        query: {
          consumer_customer_uuid: customerUuid,
          field: ['name', 'uuid'],
          page_size: 200,
        },
      }),
    enabled: Boolean(customerUuid),
  });

  const available = data?.data ?? [];

  const toggleOffering = (uuid: string) => {
    onChange(
      'offerings',
      offerings.includes(uuid)
        ? offerings.filter((item) => item !== uuid)
        : [...offerings, uuid],
    );
  };

  return (
    <Form.Group className="mb-4">
      <Form.Label>{translate('Applies to')}</Form.Label>

      <Form.Check
        type="checkbox"
        id="access-subnet-portal-scope"
        label={ENV.plugins.WALDUR_CORE.SITE_NAME}
        checked={appliesToPortal}
        onChange={(e) => onChange('applies_to_portal', e.target.checked)}
      />
      {appliesToPortal && (
        <Form.Text className="d-block text-warning mb-2">
          {translate(
            'Once any address is listed for sign-in, only listed addresses can sign in on behalf of this organization.',
          )}
        </Form.Text>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : available.length === 0 ? (
        <Form.Text className="d-block text-muted">
          {translate(
            'This organization has no resources of an offering that supports access subnets.',
          )}
        </Form.Text>
      ) : (
        available.map((offering) => (
          <Form.Check
            key={offering.uuid}
            type="checkbox"
            id={`access-subnet-offering-${offering.uuid}`}
            label={offering.name}
            checked={offerings.includes(offering.uuid)}
            onChange={() => toggleOffering(offering.uuid)}
          />
        ))
      )}
    </Form.Group>
  );
};
