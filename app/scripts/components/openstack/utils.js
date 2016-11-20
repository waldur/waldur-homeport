export function formatFlavorDetails($filter, value) {
  const ram = $filter('filesize')(value.ram);
  const storage = $filter('filesize')(value.disk);
  const props = `${value.cores} vCPU, ${ram} RAM, ${storage} storage`;
  return `${value.name} (${props})`;
}

export function formatPackageDetails($filter, value) {
  const ram = $filter('filesize')(value.ram);
  const storage = $filter('filesize')(value.storage);
  const props = `${value.cores} vCPU, ${ram} RAM, ${storage} storage`;
  return `${value.name} (${props})`;
}

export function parsePackage(choice) {
  /* Output is item with the following format:
  {
    "url": "https://example.com/api/package-templates/2/",
    "name": "Minimal VPC package",
    "price": {
      "day": 1,
      "month": 30,
      "year": 365
    },
    "ram": 20240,
    "cores": 20,
    "storage": 51200,
  }
  */
  const components = choice.item.components.reduce((map, item) => {
    map[item.type] = item.amount;
    return map;
  }, {});
  var dailyPrice = choice.item.price * 24;
  const item = angular.extend({
    url: choice.item.url,
    name: choice.item.name,
    description: choice.item.description,
    dailyPrice: dailyPrice,
    monthlyPrice: dailyPrice * 30,
    annualPrice: dailyPrice * 365
  }, components);
  return {item};
}
