export default {
  order: [
    'name',
    'region',
    'image',
    'size',
    'ssh_public_key',
    'user_data'
  ],
  options: {
    name: {
      type: 'string',
      required: true,
      label: 'VM name',
      maxlength: 150
    },
    region: {
      type: 'list',
      required: true,
      label: 'Region',
      columns: [
        {
          name: 'name',
          label: 'Region name'
        }
      ]
    },
    image: {
      type: 'list',
      required: true,
      label: 'Image',
      columns: [
        {
          name: 'name',
          label: 'Image name'
        },
        {
          name: 'is_official',
          label: 'Is official',
        }
      ],
      formatter: imageFormatter
    },
    size: {
      type: 'list',
      required: true,
      label: 'Size',
      columns: [
        {
          name: 'name',
          label: 'Size name'
        },
        {
          name: 'cores',
          label: 'vCPU'
        },
        {
          name: 'ram',
          label: 'RAM',
          filter: 'filesize'
        },
        {
          name: 'disk',
          label: 'Storage',
          filter: 'filesize'
        }
      ],
      formatter: sizeFormatter
    },
    ssh_public_key: {
      type: 'list',
      label: 'SSH public key',
      columns: [
        {
          name: 'name',
          label: 'Name'
        },
        {
          name: 'fingerprint',
          label: 'Fingerprint'
        }
      ],
      warningMessage: `SSH public key is required for accessing a provisioned VM. You can add a key in your <a ui-sref="profile.keys">profile</a>.`
    },
    user_data: {
      type: 'text',
      label: 'User data',
      help_text: 'Additional data that will be added to instance on provisioning'
    }
  },
  watchers: {
    region: regionWatcher
  }
};

function validateAndSort(model, options, validator, comparator, name) {
  const choices = options[name].choices;
  angular.forEach(choices, choice => {
    choice.item.disabled = validator(model, choice.item);
  });
  choices.sort(comparator);
  if (model[name] && model[name].disabled) {
    model[name] = null;
  }
}

function regionWatcher(model, options) {
  validateAndSort(model, options, imageValidator, imageComparator, 'image');
  validateAndSort(model, options, sizeValidator, sizeComparator, 'size');
}

function imageFormatter($filter, value) {
  if (value.is_official) {
    return value.name + ' distribution';
  } else {
    return value.name + ' snapshot created at ' + $filter('shortDate')(value.created_at);
  }
}

function imageValidator(model, choice) {
  if (!model.region) {
    return true;
  }
  var region = model.region.url;
  var found = false;
  var regions = choice.regions || [choice.region];
  for (var j = 0; j < regions.length; j++) {
    var choice_region = regions[j];
    if (choice_region.url == region) {
      found = true;
      break;
    }
  }
  return !found;
}

function imageComparator(a, b) {
  if (a.item.disabled < b.item.disabled) return -1;
  if (a.item.disabled > b.item.disabled) return 1;

  if (a.item.name > b.item.name) return 1;
  if (a.item.name < b.item.name) return -1;

  return 0;
}

function sizeComparator(a, b) {
  if (a.item.disabled < b.item.disabled) return -1;
  if (a.item.disabled > b.item.disabled) return 1;

  if (a.item.cores > b.item.cores) return 1;
  if (a.item.cores < b.item.cores) return -1;

  if (a.item.ram > b.item.ram) return 1;
  if (a.item.ram < b.item.ram) return -1;

  if (a.item.disk > b.item.disk) return 1;
  if (a.item.disk < b.item.disk) return -1;

  return 0;
}

const sizeValidator = imageValidator;

function sizeFormatter($filter, value) {
  const ram = $filter('filesize')(value.ram);
  const storage = $filter('filesize')(value.disk);
  const props = `${value.cores} vCPU, ${ram} RAM, ${storage} storage`;
  return `${value.name} (${props})`;
}
