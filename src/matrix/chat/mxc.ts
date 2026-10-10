// The Matrix spec's grammar for an mxc URI: a server name (hostname, IPv4 or
// bracketed IPv6, then an optional port) and a media id of [A-Za-z0-9_-].
// Both end up in the download path, so anything looser could walk it: a
// server name of ".." would turn a download into another endpoint, fetched
// with the user's access token.
const MXC_URL =
  /^mxc:\/\/((?:[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*|\[[0-9A-Fa-f:.]{2,45}\])(?::[0-9]{1,5})?)\/([A-Za-z0-9_-]+)$/;

/** Split an mxc URI into its server name and media id, or null if malformed. */
export const parseMxcUrl = (
  url: unknown,
): { serverName: string; mediaId: string } | null => {
  if (typeof url !== 'string') return null;
  const match = MXC_URL.exec(url);
  return match ? { serverName: match[1], mediaId: match[2] } : null;
};
