import { ChecklistStats } from './types';

export const initCustomer = (props = {}): ChecklistStats => {
  return {
    uuid: '1',
    name: 'Alex',
    score: 0,
    latitude: 49.601984,
    longitude: 95.63666172955419,
    ...props,
  };
};
