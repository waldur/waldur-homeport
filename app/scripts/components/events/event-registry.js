import { EVENT_TEMPLATES } from './constants';

// @ngInject
export default function eventRegistry() {

  var EVENTTYPE = {};
  for (var key in EVENT_TEMPLATES) {
    EVENTTYPE[key] = key;
  }

  function type_to_entity(type) {
    return type.split('_')[0];
  }

  function types_to_entities(types) {
    var entities = [];
    for (var i = 0; i < types.length; i++) {
      var entity = type_to_entity(types[i]);
      if (entities.indexOf(entity) == -1) {
        entities.push(entity);
      }
    }
    entities.sort();
    return entities;
  }

  function entities_to_types(entities) {
    var types = [];
    for(var type in EVENTTYPE) {
      var entity = type_to_entity(type);
      if (entities.indexOf(entity) != -1) {
        types.push(type);
      }
    }
    types.sort();
    return types;
  }

  function get_entities() {
    var types = [];
    for(var type in EVENTTYPE) {
      types.push(type);
    }
    var entities = types_to_entities(types);
    entities.sort(function(a, b) {
      return a.localeCompare(b);
    });
    return entities;
  }

  return {
    entities: get_entities(),
    types_to_entities: types_to_entities,
    entities_to_types: entities_to_types
  };
}
