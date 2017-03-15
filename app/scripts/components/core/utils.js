export const listToDict = (key, value) => list => {
  let dict = {};
  angular.forEach(list, item => {
    dict[key(item)] = value(item);
  });
  return dict;
};
