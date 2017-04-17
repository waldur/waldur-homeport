// @ngInject
export function coreUtils($filter) {
  return {
    templateFormatter: function(template, params) {
      let formattedString = template.replace(/{(.+?)}/g, function(match, key) {
        return params[key];
      }
      );
      return $filter('translate')(formattedString);
    }
  };
}

export const listToDict = (key, value) => list => {
  let dict = {};
  angular.forEach(list, item => {
    dict[key(item)] = value(item);
  });
  return dict;
};

export function ncUtils() {
  return {
    isFileOption: function(option) {
      return option.type == 'file upload';
    },
    isFileValue: function(value) {
      return value.toString() == '[object File]';
    },
    getFilename: function(value) {
      if (!value) {
        return '';
      }
      else if (value.length == 1) {
        return value[0].name;
      } else if (angular.isString(value)) {
        var parts = value.split('/');
        return parts[parts.length - 1];
      }
    },
    getPrettyQuotaName: function(name) {
      return name.replace(/nc_|_count/g, '').replace(/_/g, ' ');
    },
    isCustomerQuotaReached: function(customer, quotaName) {
      var quotas = customer.quotas || [];
      for (var i = 0; i < quotas.length; i++) {
        var value = quotas[i];
        var name = this.getPrettyQuotaName(value.name);
        if (name === quotaName && value.limit > -1 && (value.limit === value.usage || value.limit === 0)) {
          return {name: name, usage: [value.limit, value.usage]};
        }
      }
      return false;
    },
    getQuotaUsage: function(quotas) {
      var usage = {};
      for (var i = 0; i < quotas.length; i++) {
        var quota = quotas[i];
        usage[quota.name] = Math.max(0, quota.usage);
      }
      return usage;
    },
    getQueryString: function() {
      // Example input: http://example.com/#/approve/?foo=123&bar=456
      // Example output: foo=123&bar=456

      var hash = document.location.hash;
      var parts = hash.split('?');
      if (parts.length > 1) {
        return parts[1];
      }
      return '';
    },
    relativeDate: function (startTime) {
      return moment(startTime).fromNow().replace(' ago', '');
    },
    getUUID: function(url) {
      return url.split('/').splice(-2)[0];
    },
    renderLink: function(href, name) {
      return '<a href="{href}">{name}</a>'
              .replace('{href}', href)
              .replace('{name}', name);
    },
    renderAvatar: function(user) {
      var avatar = '<img gravatar-src="\'{gravatarSrc}\'" gravatar-size="100" alt="" class="avatar-img img-xs">'
        .replace('{gravatarSrc}', user.email);
      return avatar + ' ' + (user.full_name || user.username);
    },
    parseQueryString: function(qs) {
      // Example input: foo=123&bar=456
      // Example output: {foo: "123", bar: "456"}

      return qs.split('&').reduce(function(result, part){
        var tokens = part.split('=');
        if (tokens.length > 1) {
          var key = tokens[0];
          var value = tokens[1];
          result[key] = value;
        }
        return result;
      }, {});
    },
    toKeyValue: function (obj) {
      var parts = [];
      angular.forEach(obj, function(value, key) {
        parts.push(key + '=' + encodeURIComponent(value));
      });
      return parts.length ? parts.join('&') : '';
    },
    startsWith: function(string, target) {
      return string.indexOf(target) === 0;
    },
    endsWith: function(string, target) {
      return string.indexOf(target) === (string.length - target.length);
    },
    mergeLists: function(list1, list2, fieldIdentifier) {
      list1 = list1 || [];
      list2 = list2 || [];
      fieldIdentifier = fieldIdentifier || 'uuid';
      var itemByUuid = {},
        newListUiids = list2.map(function(item) {
          return item[fieldIdentifier];
        });
      for (let i = 0; i < list1.length; i++) {
        var item = list1[i];
        itemByUuid[item[fieldIdentifier]] = item;
      }

      // Remove stale items
      list1 = list1.filter(function(item) {
        return newListUiids.indexOf(item[fieldIdentifier]) !== -1;
      });

      // Add or update remaining items
      for (let i = 0; i < list2.length; i++) {
        var item2 = list2[i];
        var item1 = itemByUuid[item2[fieldIdentifier]];
        if (!item1) {
          list1.push(item2);
          continue;
        }
        for (var key in item2) {
          item2.hasOwnProperty(key) && (item1[key] = item2[key]);
        }
      }
      return list1;
    },
    sortObj: function(obj, order) {
      var i,
        tempArry = Object.keys(obj),
        tempObj = {};

      tempArry.sort(
        function(a, b) {
          return a.toLowerCase().localeCompare(b.toLowerCase());
        }
      );

      if (order === 'desc') {
        for (i = tempArry.length - 1; i >= 0; i--) {
          tempObj[tempArry[i]] = obj[tempArry[i]];
        }
      } else {
        for (i = 0; i < tempArry.length; i++) {
          tempObj[tempArry[i]] = obj[tempArry[i]];
        }
      }

      return tempObj;
    },
    truncateTo: function(str, limit) {
      return str.length > limit ? str.slice(0, limit) + '..' : str;
    },
    // @param order - 0 for asc, 1 for desc
    sortArrayOfObjects: function(arr, field, desc) {
      var vm = this;
      vm.field = field;
      vm.desc = desc;
      function compare(a,b) {
        if (a[vm.field] < b[vm.field])
          return desc ? 1 : -1;
        else if (a[vm.field] > b[vm.field])
          return !desc ? 1 : -1;
        else
          return 0;
      }
      return arr.sort(compare);
    },
  };
}
