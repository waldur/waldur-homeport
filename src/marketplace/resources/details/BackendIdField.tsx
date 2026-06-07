import { PublicOfferingDetails, Resource } from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

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

  return (
    <Field
      label={label}
      value={
        <span className="d-flex align-items-center gap-2">
          <span>{highlightedId}</span>
          <CopyToClipboardButton value={highlightedId} onlyButton />
        </span>
      }
    />
  );
};
