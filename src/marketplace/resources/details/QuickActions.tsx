import { ActionRegistry } from '@waldur/resource/actions/registry';

import { ActionButton } from './ActionButton';

export const QuickActions = ({ resource, refetch }) => {
  const actions = ActionRegistry.getQuickActions(resource.resource_type);
  return (
    <>
      {actions.map((ActionComponent, index) => (
        <ActionComponent
          key={index}
          resource={resource}
          refetch={refetch}
          as={ActionButton}
        />
      ))}
    </>
  );
};
