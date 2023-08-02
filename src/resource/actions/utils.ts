export const parseValidators = (validators, context) => {
  let reason = '';
  if (validators) {
    for (const validator of validators) {
      reason = validator(context);
      if (reason) {
        return reason;
      }
    }
  }
};
