const EVENT_ICONS = {
  resource_creation_failed: 'fa-warning',
  resource_creation_scheduled: 'fa-spinner',
  resource_creation_succeeded: 'fa-check',
};

export const EventIcon = ({ type }) => {
  let eventIcon = EVENT_ICONS[type];
  if (!eventIcon && type.endsWith('_failed')) {
    eventIcon = 'fa-warning';
  }
  if (!eventIcon && type.endsWith('_scheduled')) {
    eventIcon = 'fa-spinner';
  }
  if (!eventIcon && type.endsWith('_succeeded')) {
    eventIcon = 'fa-check';
  }
  return (
    <div className="symbol-label bg-light">
      {eventIcon && <i className={`fa ${eventIcon}`} />}
    </div>
  );
};
