import { ResourceUsersList } from './ResourceUsersList';

export const ResourceUsersCard = ({ resource, offering }) => (
  <div className="mb-10" id="users">
    <ResourceUsersList resource={resource} offering={offering} />
  </div>
);