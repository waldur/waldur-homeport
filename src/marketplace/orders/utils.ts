const STATES_MATCHING = {
  'draft': 'Configure',
  'requested for approval': 'Approve',
  'default': 'Review',
};

export const matchState = state => {
  if (STATES_MATCHING[state]) {
    return STATES_MATCHING[state];
  }
  return STATES_MATCHING.default;
};
