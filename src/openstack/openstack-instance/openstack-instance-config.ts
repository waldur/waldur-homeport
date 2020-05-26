import { formatFlavor } from '@waldur/resource/utils';

export function internalIpFormatter(subnet) {
  return `${subnet.name} (${subnet.cidr})`;
}

export function flavorFormatter(flavor) {
  const props = formatFlavor(flavor);
  return `${flavor.name} (${props})`;
}

export function flavorComparator(a, b) {
  if (a.disabled < b.disabled) return -1;
  if (a.disabled > b.disabled) return 1;

  if (a.cores > b.cores) return 1;
  if (a.cores < b.cores) return -1;

  if (a.ram > b.ram) return 1;
  if (a.ram < b.ram) return -1;

  if (a.disk > b.disk) return 1;
  if (a.disk < b.disk) return -1;
  return 0;
}

export function flavorValidator(model, choice) {
  if (!model.image) {
    return true;
  }
  if (model.image.min_ram > choice.ram) {
    return true;
  }
  return false;
}
