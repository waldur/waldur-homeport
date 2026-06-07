import { Link } from '@/core/Link';
import { getUserContext } from '@/events/utils';
import { ResourcesEnum } from '@/EventsEnums';
import { translate } from '@/i18n';

const getPolicyContext = (event) => ({
  ...getUserContext(event),
  resource_link: event.resource_uuid ? (
    <Link
      state="marketplace-resource-details"
      params={{
        resource_type: event.resource_type,
        resource_uuid: event.resource_uuid,
        uuid: event.project_uuid,
      }}
    >
      {event.resource_name}
    </Link>
  ) : (
    event.resource_name || ''
  ),
});

export const PolicyEvents = {
  title: translate('Policy events'),
  context: getPolicyContext,
  events: [
    {
      key: ResourcesEnum.request_downscaling,
      title: translate('{resource_link} has been downscaled by a cost policy.'),
    },
    {
      key: ResourcesEnum.reset_downscaling,
      title: translate('{resource_link} downscaling has been removed.'),
    },
    {
      key: ResourcesEnum.request_pausing,
      title: translate('{resource_link} has been paused by a cost policy.'),
    },
    {
      key: ResourcesEnum.reset_pausing,
      title: translate('{resource_link} has been unpaused.'),
    },
    {
      key: ResourcesEnum.restrict_members,
      title: translate(
        '{resource_link} member access has been restricted by a cost policy.',
      ),
    },
    {
      key: ResourcesEnum.reset_member_restriction,
      title: translate(
        '{resource_link} member access restriction has been removed.',
      ),
    },
    {
      key: ResourcesEnum.request_slurm_resource_downscaling,
      title: translate(
        '{resource_link} has been downscaled by a usage policy.',
      ),
    },
    {
      key: ResourcesEnum.request_slurm_resource_pausing,
      title: translate('{resource_link} has been paused by a usage policy.'),
    },
  ],
};
