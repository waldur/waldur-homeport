import { PublicOfferingDetails, Resource } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';

export const BackendIdField = ({
  resource,
  offering,
}: {
  resource: Resource;
  offering: PublicOfferingDetails;
}) => {
  const highlightedId = offering.plugin_options
    ?.require_effective_id_for_highlighted_display
    ? resource.effective_id
    : resource.effective_id || resource.backend_id;

  if (
    !highlightedId ||
    !offering.plugin_options?.highlight_backend_id_display
  ) {
    return null;
  }

  // Use custom label if provided, otherwise default to "Backend ID"
  const label =
    offering.plugin_options?.backend_id_display_label ||
    translate('Backend ID');

  return <PropertyItem label={label} value={highlightedId} hasCopy />;
};
