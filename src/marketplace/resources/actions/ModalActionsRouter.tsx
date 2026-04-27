import { ModalActionsButton } from '@/marketplace/resources/actions/ModalActionsButton';

import { ActionsLists } from './ActionsLists';

export const ModalActionsRouter = (props) => (
  <ModalActionsButton
    {...props}
    ActionsList={ActionsLists[props.offering_type]}
  />
);
