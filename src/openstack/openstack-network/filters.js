export function formatAllocationPool() {
  return pools => {
    if (pools.length === 0) {
      return '―';
    } else {
      return pools.map(pool => `${pool.start} ― ${pool.end}`).join('<br />');
    }
  };
}
