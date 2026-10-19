// The managed mutation hooks live in waldur-shell, so micro-apps share them.
// Importing the app's notify module registers its API error formatter, which
// the hooks' error toasts use.
import '@/store/notify';

export { useManagedMutation } from 'waldur-shell';
