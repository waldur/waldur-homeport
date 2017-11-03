import { EVENT_TEMPLATES } from './constants';

// @ngInject
export default function eventRegistry() {

  let EVENTTYPE = {};
  for (let key in EVENT_TEMPLATES) {
    EVENTTYPE[key] = key;
  }

  function type_to_entity(type) {
    return type.split('_')[0];
  }

  function types_to_entities(types) {
    let entities = [];
    for (let i = 0; i < types.length; i++) {
      let entity = type_to_entity(types[i]);
      if (entities.indexOf(entity) === -1) {
        entities.push(entity);
      }
    }
    entities.sort();
    return entities;
  }

  function entities_to_types(entities) {
    let types = [];
    for(let type in EVENTTYPE) {
      let entity = type_to_entity(type);
      if (entities.indexOf(entity) !== -1) {
        types.push(type);
      }
    }
    types.sort();
    return types;
  }

  function get_entities() {
    let types = [];
    for(let type in EVENTTYPE) {
      types.push(type);
    }
    let entities = types_to_entities(types);
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
