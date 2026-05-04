import {
  openstackFlavorsList,
  OpenstackFlavorsListData,
  openstackFloatingIpsList,
  OpenstackFloatingIpsListData,
  openstackImagesList,
  OpenstackImagesListData,
  openstackNetworksList,
  OpenstackNetworksListData,
  openstackSecurityGroupsList,
  OpenstackSecurityGroupsListData,
  openstackSubnetsList,
  OpenstackSubnetsListData,
  openstackVolumeTypesList,
  OpenstackVolumeTypesListData,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';

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

export const loadImages = (query: OpenstackImagesListData['query']) =>
  getAllPages((page) => openstackImagesList({ query: { page, ...query } }));
