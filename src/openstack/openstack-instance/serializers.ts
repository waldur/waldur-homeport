import { OpenStackCreateInstancePortRequest } from 'waldur-js-client';

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

const serializePorts = (networks, portSecurityEnabled?: boolean) => {
  if (!networks?.length || !networks[0]?.subnet) {
    return undefined;
  }

  return networks.map((network) => {
    const port: OpenStackCreateInstancePortRequest = {
      subnet: network.subnet.url,
    };

    // Add fixed_ip if it exists
    if (network.fixed_ip) {
      port.fixed_ips = [
        { ip_address: network.fixed_ip, subnet_id: network.subnet.backend_id },
      ];
    }

    if (portSecurityEnabled === false) {
      port.port_security_enabled = false;
    }

    return port;
  });
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
  return { url: group.url };
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
  port_security_enabled,
}) => ({
  name,
  description,
  user_data,
  image: image ? image.url : undefined,
  flavor: flavor ? flavor.url : undefined,
  ssh_public_key: ssh_public_key ? ssh_public_key.url : undefined,
  security_groups:
    port_security_enabled === false
      ? undefined
      : serializeSecurityGroups(security_groups),
  server_group: serializeServerGroup(server_group),
  ports: serializePorts(networks, port_security_enabled),
  floating_ips: serializeFloatingIPs(networks),
  system_volume_size,
  data_volume_size: data_volume_size ? data_volume_size : undefined,
  system_volume_type: system_volume_type && system_volume_type.value,
  data_volume_type: data_volume_type && data_volume_type.value,
  availability_zone,
});
