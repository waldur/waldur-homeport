import { useTerminate } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { ResourceAccessButton } from '@waldur/resource/ResourceAccessButton';

import { useChangeLimits } from '../change-limits/ChangeLimitsAction';

import { ActionButton } from './ActionButton';

const TerminateActionButton = ({ resource }) => {
  const buttonProps = useTerminate({ resource });
  return <ActionButton iconClass="fa-trash" {...buttonProps} />;
};

const ChangeLimitsActionButton = ({ resource }) => {
  const buttonProps = useChangeLimits({ resource });
  return resource.is_limit_based ? (
    <ActionButton iconClass="fa-pencil" {...buttonProps} />
  ) : null;
};

export const QuickActions = ({ resource }) => (
  <>
    <ResourceAccessButton resource={resource} />
    <ChangeLimitsActionButton resource={resource} />
    <TerminateActionButton resource={resource} />
  </>
);
