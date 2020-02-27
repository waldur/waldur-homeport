export function availabilityEvent(event) {
  if (event && event.type === 'availability' || event.extendedProps.type === 'availability') {
    event.rendering = 'background';
    event.backgroundColor = 'green';
  }
}

export function statedEvent(event) {
  if (event && event.state) {
    event.groupId = event.state;
  }
}

export function configurationEvent(event) {
  if (event && event.type === ( 'single-entity' || 'config' || 'availability-config')) {
    event.constants = 'businessHours';
  }
}

export function scheduleEvent(event) {
  if (event && event.type === 'ScheduleBooking') {
    event.rendering = undefined;
    event.constants = 'businessHours';
    event.backgroundColor = 'pink';
  }
}
