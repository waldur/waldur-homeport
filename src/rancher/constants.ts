export const DEFAULT_NODE_CONFIGURATION = {
  memory: 4,
  storage: 100,
  cpu: 2,
  roles: [
    'worker',
  ],
};

export const DEFAULT_CLUSTER_CONFIGURATION = {
  nodes: [
    {
      memory: 16,
      storage: 100,
      cpu: 8,
      roles: [
        'controlplane',
        'etcd',
        'worker',
      ],
    },
  ],
};
