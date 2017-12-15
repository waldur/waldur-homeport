interface Quota {
  quota: string;
  title: string;
  feature?: string;
  formatter?: (usage: number) => number;
  dashboards: string[];
}

const registry: {[key: string]: Quota[]} = {};

export function registerQuotas(quotas: Quota[]) {
  for (const quota of quotas) {
    for (const dashboard of quota.dashboards) {
      if (!registry[dashboard]) {
        registry[dashboard] = [];
      }
      registry[dashboard].push(quota);
    }
  }
}

export function getDashboardQuotas(dashboard: string) {
  return registry[dashboard];
}
