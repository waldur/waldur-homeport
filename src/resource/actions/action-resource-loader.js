// @ngInject
export default function ActionResourceLoader($q, $filter, HttpUtils) {
  return {
    getSelectList,
    loadChoices,
    formatChoices,
    loadRawChoices,
  };

  function getSelectList(fields) {
    let promises = [];
    angular.forEach(fields, function(field) {
      if (field.url) {
        promises.push(loadChoices(field));
      }
    });
    return $q.all(promises);
  }

  function loadChoices(field) {
    return loadRawChoices(field).then(items => {
      let choices = formatChoices(field, items);
      if (field.emptyLabel && !field.required) {
        choices.unshift({
          display_name: field.emptyLabel,
        });
      }
      field.choices = choices;
      field.rawChoices = items;
    });
  }

  function valueFormatter(field, item) {
    if (field.valueFormatter) {
      return field.valueFormatter(item);
    } else {
      return item[field.value_field];
    }
  }

  function displayFormatter(field, item) {
    if (field.formatter) {
      return field.formatter($filter, item);
    } else {
      return item[field.display_name_field];
    }
  }

  function formatChoices(field, items) {
    return items.map(item => ({
      value: valueFormatter(field, item),
      display_name: displayFormatter(field, item),
    }));
  }

  function loadRawChoices(field) {
    return HttpUtils.getAll(field.url);
  }
}
