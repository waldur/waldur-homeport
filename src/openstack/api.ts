import {
  openstackFlavorsList,
  OpenstackFlavorsListData,
  openstackFloatingIpsList,
  OpenstackFloatingIpsListData,
  openstackNetworksList,
  OpenstackNetworksListData,
  openstackSecurityGroupsList,
  OpenstackSecurityGroupsListData,
  openstackSubnetsList,
  OpenstackSubnetsListData,
  openstackVolumeTypesList,
  OpenstackVolumeTypesListData,
} from 'waldur-js-client';
import { client } from 'waldur-js-client/client.gen';

import { getAllPages } from '@waldur/core/api';

export interface DestroyInstanceParams {
  delete_volumes?: boolean;
  release_floating_ips?: boolean;
}

export const loadFlavors = (query: OpenstackFlavorsListData['query']) =>
  getAllPages((page) => openstackFlavorsList({ query: { page, ...query } }));

export const loadSecurityGroups = (
  query: OpenstackSecurityGroupsListData['query'],
) =>
  getAllPages((page) =>
    openstackSecurityGroupsList({ query: { page, ...query } }),
  );

export const loadVolumeTypes = (query: OpenstackVolumeTypesListData['query']) =>
  getAllPages((page) =>
    openstackVolumeTypesList({ query: { page, ...query } }),
  );

export const loadNetworks = (query: OpenstackNetworksListData['query']) =>
  getAllPages((page) => openstackNetworksList({ query: { page, ...query } }));

export const loadSubnets = (query: OpenstackSubnetsListData['query']) =>
  getAllPages((page) => openstackSubnetsList({ query: { page, ...query } }));

export const loadFloatingIps = (query: OpenstackFloatingIpsListData['query']) =>
  getAllPages((page) =>
    openstackFloatingIpsList({ query: { page, ...query } }),
  );

export const ShareOpenstackNetwork = (option: {
  path: { uuid: string };
  body: { target_tenant; policy_type };
}) =>
  client.post({
    security: [
      {
        name: 'Authorization',
        type: 'apiKey',
      },
    ],
    url: '/api/openstack-networks/{uuid}/rbac_policy_create/',
    ...option,
    headers: {
      'Content-Type': 'application/json',
    },
  });

export const deleteNetworkRBAC = (path: {
  network_uuid: string;
  uuid: string;
}) =>
  client.delete({
    url: '/api/openstack-networks/{network_uuid}/rbac_policy_delete/{uuid}/',
    path,
    security: [
      {
        name: 'Authorization',
        type: 'apiKey',
      },
    ],
  });
