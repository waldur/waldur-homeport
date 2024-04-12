import { ActionDialogBody } from './ActionDialogBody';
import { ActionDialogHeader } from './ActionDialogHeader';

export const ModalActionsDialog = ({
  name,
  refetch,
  ActionsList,
  resource,
  marketplaceResource,
}) => (
  <>
    <ActionDialogHeader marketplaceResource={marketplaceResource} name={name} />
    <ActionDialogBody>
      <ActionsList
        marketplaceResource={marketplaceResource}
        resource={resource}
        refetch={refetch}
      />
    </ActionDialogBody>
  </>
);
