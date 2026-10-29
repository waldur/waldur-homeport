export const getResourceFilterFromSearchItem = (item: {
  to;
  params?;
  title;
}) => {
  const filter = { organization: null, project: null };

  switch (item.to) {
    case 'organization.dashboard':
      filter.organization = { uuid: item.params.uuid, name: item.title };
      break;
    case 'project.dashboard':
      filter.project = { uuid: item.params.uuid, name: item.title };
      if (item.params.customer_uuid) {
        Object.assign(filter.project, {
          customer_uuid: item.params.customer_uuid,
          customer_name: item.params.customer_name,
        });
        filter.organization = {
          uuid: item.params.customer_uuid,
          name: item.params.customer_name,
        };
      }
      break;
    case 'marketplace-resource-details':
      if (item.params.project_uuid && item.params.project_name) {
        filter.project = {
          uuid: item.params.project_uuid,
          name: item.params.project_name,
        };
        if (item.params.customer_uuid) {
          Object.assign(filter.project, {
            customer_uuid: item.params.customer_uuid,
            customer_name: item.params.customer_name,
          });
          filter.organization = {
            uuid: item.params.customer_uuid,
            name: item.params.customer_name,
          };
        }
      }
      break;

    default:
      break;
  }
  return filter;
};

const isMac = () => {
  if (typeof navigator === 'undefined') return false;
  const platform =
    (navigator as any).userAgentData?.platform || navigator.platform || '';
  return /Mac|iPhone|iPad|iPod/i.test(platform);
};

export const getShortcutHint = (key = 'K') => {
  return isMac() ? `⌘${key}` : `Ctrl+${key}`;
};
