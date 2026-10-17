/**
 * Prefix of the per-user, per-room command lists. They depend on the user's
 * open ticket drafts, as `ticket send` needs one, so drafts refresh them.
 */
export const ROOM_COMMANDS_QUERY_KEY = ['MatrixRoomCommands'];
