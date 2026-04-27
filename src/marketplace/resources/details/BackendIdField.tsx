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
  // Use effective_id if available, otherwise backend_id
  const backendId = resource.effective_id || resource.backend_id;

  // Only show if backend_id exists and highlight_backend_id_display is true
  if (!backendId || !offering.plugin_options?.highlight_backend_id_display) {
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
          <span>{backendId}</span>
          <CopyToClipboardButton value={backendId} onlyButton />
        </span>
      }
    />
  );
};
