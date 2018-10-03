export const countSelectedFilters = filterValues => {
  const selectedFilters = [];
  if (filterValues) {
    Object.keys(filterValues).forEach(value => {
      const fieldKey = value.split('-')[1];
      if (selectedFilters.indexOf(fieldKey) === -1) {
        selectedFilters.push(fieldKey);
      }
    });
  }
  return selectedFilters.length;
};

export const countSelectedFilterValues = (filterValues, key) => {
  let counter = 0;
  if (filterValues) {
    Object.keys(filterValues).forEach(value => {
      const filterName = value.split('-')[1];
      if (filterName === key) {
        counter += 1;
      }
    });
  }
  return counter;
};
