import { ActionButton } from '@waldur/marketplace/resources/details/ActionButton';
import { useTerminate } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { usePull } from '@waldur/resource/actions/PullActionItem';

import { pullAllocation } from '../api';
import { useSetLimits } from '../SetLimitsAction';

const PullActionButton = ({ resource }) => {
  const buttonProps = usePull({ resource, apiMethod: pullAllocation });
  return <ActionButton iconClass="fa-refresh" {...buttonProps} />;
};

const TerminateActionButton = ({ resource }) => {
  const buttonProps = useTerminate({ resource });
  return <ActionButton iconClass="fa-trash" {...buttonProps} />;
};

const SetLimitsActionButton = ({ resource }) => {
  const buttonProps = useSetLimits({ resource });
  return <ActionButton iconClass="fa-pencil" {...buttonProps} />;
};

export const QuickActions = ({ resource }) => (
  <>
    <SetLimitsActionButton resource={resource} />
    <PullActionButton resource={resource} />
    <TerminateActionButton resource={resource} />
  </>
);
