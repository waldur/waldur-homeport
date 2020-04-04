const LOCALE_UPDATED = 'waldur/core/LOCALE_UPDATED';

export const localeUpdated = locale => ({
  type: LOCALE_UPDATED,
  payload: {
    locale,
  },
});

const INITIAL_STATE = null;

export const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LOCALE_UPDATED:
      return action.payload.locale;

    default:
      return state;
  }
};
