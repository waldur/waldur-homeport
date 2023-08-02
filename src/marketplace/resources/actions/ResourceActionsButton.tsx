import { FunctionComponent } from 'react';
import { useBoolean } from 'react-use';

import { Resource } from '@waldur/marketplace/resources/types';
import { ResourceActionComponent } from '@waldur/resource/actions/ResourceActionComponent';

import { ActionsList } from './ActionsList';

interface ResourceActionsButtonProps {
  resource: Resource;
  refetch?(): void;
}

export const ResourceActionsButton: FunctionComponent<ResourceActionsButtonProps> =
  (props) => {
    const [open, onToggle] = useBoolean(false);

    return (
      <ResourceActionComponent
        open={open}
        onToggle={onToggle}
        actions={ActionsList}
        resource={props.resource}
        refetch={props.refetch}
      />
    );
  };
