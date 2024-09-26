import { translate } from '@waldur/i18n';
import { ResourceEvents } from '@waldur/resource/tabs/ResourceEvents';

export const ActivityCard = ({ resource }) => (
  <ResourceEvents
    title={translate('Audit logs')}
    initialPageSize={5}
    marketplaceResource={resource}
    className="card-bordered"
  />
);
