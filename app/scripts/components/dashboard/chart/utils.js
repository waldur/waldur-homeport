export const createByKey = (predicate, mapActionToKey) => reducer => {
  return (state = {}, action) => {
    if (predicate(action)) {
      const key = mapActionToKey(action);
      return { ...state, [key]: reducer(state[key], action) };
    }
    return state;
  };
};
