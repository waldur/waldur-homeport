const EVENT_ICONS = {
  resource_creation_failed: 'fa-warning',
  resource_creation_scheduled: 'fa-spinner',
  resource_creation_succeeded: 'fa-check',
};

const SUFFIXES = {
  _failed: 'fa-warning',
  _scheduled: 'fa-spinner',
  _succeeded: 'fa-check',
  _requested: 'fa-first-order',
};

export const EventIcon = ({ type }) => {
  let eventIcon: string = EVENT_ICONS[type];
  for (const suffix in SUFFIXES) {
    if (!eventIcon && type.endsWith(suffix)) {
      eventIcon = SUFFIXES[suffix];
    }
  }
  return (
    <div className="symbol-label bg-light">
      {eventIcon && <i className={`fa ${eventIcon}`} />}
    </div>
  );
};
