import { ResourceUsersList } from './ResourceUsersList';

export const ResourceUsersCard = ({ resource, offering }) => {
  return offering.roles?.length > 0 ? (
    <div id="users">
      <ResourceUsersList resource={resource} offering={offering} />
    </div>
  ) : null;
};
