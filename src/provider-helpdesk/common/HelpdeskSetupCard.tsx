import { LifebuoyIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { hasProviderRouting } from '@/issues/hooks';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { useCustomer, useUser } from '@/workspace/hooks';

const HelpdeskSettingsForm = lazyComponent(() =>
  import('../configuration/HelpdeskSettingsForm').then((module) => ({
    default: module.HelpdeskSettingsForm,
  })),
);

/**
 * Dashboard prompt that lets staff configure a provider helpdesk when none
 * exists yet. Since the Helpdesk workspace is a separate organization mode that
 * only appears once a helpdesk is active, this card is the first-time entry
 * point: it opens the create dialog directly. On success HelpdeskSettingsForm
 * refreshes the workspace customer, so has_active_helpdesk flips and the
 * Helpdesk mode tab appears (this card then hides). Shown only when routing is
 * enabled, no helpdesk exists yet, and the user can create one (staff-only).
 */
export const HelpdeskSetupCard: FC = () => {
  const user = useUser();
  const customer = useCustomer();
  const { openDialog } = useModal();

  if (
    !hasProviderRouting() ||
    !user?.is_staff ||
    !customer ||
    customer.has_active_helpdesk
  ) {
    return null;
  }

  return (
    <Card className="mb-6">
      <Card.Body className="d-flex flex-wrap align-items-center gap-4">
        <div className="icon-square icon-lg bg-light-primary text-primary">
          <LifebuoyIcon weight="bold" size={24} />
        </div>
        <div className="flex-grow-1 min-w-200px">
          <h4 className="mb-1">{translate('Set up provider helpdesk')}</h4>
          <p className="text-tertiary fs-6 mb-0">
            {translate(
              'Route support tickets for this provider to your own helpdesk. Configure a backend to get started.',
            )}
          </p>
        </div>
        <ActionButton
          title={translate('Set up helpdesk')}
          variant="primary"
          action={() =>
            openDialog(HelpdeskSettingsForm, {
              resolve: {
                serviceProviderUuid: customer.service_provider_uuid,
                refetch: () => undefined,
              },
            })
          }
        />
      </Card.Body>
    </Card>
  );
};
