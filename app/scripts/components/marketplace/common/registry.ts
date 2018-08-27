const REGISTRY = {};

export function registerOfferingType({type, component, serializer}) {
  REGISTRY[type] = {component, serializer};
}

export function getFormComponent(offeringType) {
  return REGISTRY[offeringType].component;
}

export function getFormSerializer(offeringType) {
  return REGISTRY[offeringType].serializer || (x => x);
}
