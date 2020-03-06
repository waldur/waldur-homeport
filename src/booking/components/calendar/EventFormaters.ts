export function availabilityEvent(event) {
  if (event && (event || event.extendedProps).type === 'availability') {
    event.rendering = 'background';
    event.constraint = 'businessHours';
    if (event.title === '') {
      event.title = 'Availability';
    }
  }
}

export function statedEvent(event) {
  if (event && event.state) {
    event.groupId = event.state;
  }
}

export function configurationEvent(event) {
  if (
    event &&
    event.type ===
      ('single-entity' || 'config' || 'availability-hours' || 'availability')
  ) {
    event.constraint = 'businessHours';
  }
}

export function scheduleEvent(event) {
  if (event && (event || event.extendedProps).type === 'scheduleBooking') {
    event.rendering = undefined;
    event.constraint = 'availableForBooking';
    event.backgroundColor = 'pink';
  }
}
