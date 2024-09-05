const serializeFloatingIPs = (networks) => {
  if (!networks?.length || !networks[0]?.floatingIp) {
    return undefined;
  }
  return networks
    .filter((item) => item.floatingIp.url !== 'false')
    .map((item) => {
      // Auto-assign floating IP
      if (item.floatingIp.url === 'true') {
        return {
          subnet: item.subnet.url,
        };
      } else {
        return {
          subnet: item.subnet.url,
          url: item.floatingIp.url,
        };
      }
    });
};

const serializePorts = (networks) => {
  if (!networks?.length || !networks[0]?.subnet) {
    return undefined;
  }
  return networks.map((network) => ({
    subnet: network.subnet.url,
  }));
};

const serializeSecurityGroups = (groups) => {
  if (!groups) {
    return undefined;
  }
  return groups.map((group) => ({
    url: group.url,
  }));
};

const serializeServerGroup = (group) => {
  if (!group) {
    return undefined;
  }
  return group.url;
};

export const instanceSerializer = ({
  name,
  description,
  user_data,
  image,
  flavor,
  networks,
  system_volume_size,
  data_volume_size,
  system_volume_type,
  data_volume_type,
  ssh_public_key,
  security_groups,
  server_group,
  availability_zone,
}) => ({
  name,
  description,
  user_data,
  image: image ? image.url : undefined,
  flavor: flavor ? flavor.url : undefined,
  ssh_public_key: ssh_public_key ? ssh_public_key.url : undefined,
  security_groups: serializeSecurityGroups(security_groups),
  server_group: serializeServerGroup(server_group),
  ports: serializePorts(networks),
  floating_ips: serializeFloatingIPs(networks),
  system_volume_size,
  data_volume_size: data_volume_size ? data_volume_size : undefined,
  system_volume_type: system_volume_type && system_volume_type.value,
  data_volume_type: data_volume_type && data_volume_type.value,
  availability_zone,
});
