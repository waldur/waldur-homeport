import { DateTime } from 'luxon';

export const CreatedField = (props: { resource: { created?: string } }) =>
  props.resource.created ? (
    <span>
      {DateTime.fromISO(props.resource.created).toRelative()}
      {', '}
      {DateTime.fromISO(props.resource.created).toFormat('yyyy-MM-dd HH:mm')}
    </span>
  ) : null;
