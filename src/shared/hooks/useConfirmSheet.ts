import { useContext } from 'react';
import { ConfirmSheetContext } from '@/shared/components/ConfirmSheetProvider';

/**
 * Imperative API to open the ConfirmSheet from any screen.
 *
 * @example
 * const { show } = useConfirmSheet();
 * show({
 *   title: 'Delete Group',
 *   message: 'Are you sure? This cannot be undone.',
 *   actions: [
 *     { label: 'Delete', style: 'destructive', onPress: handleDelete },
 *     { label: 'Cancel', style: 'cancel', onPress: () => {} },
 *   ],
 * });
 */
export const useConfirmSheet = () => {
  const context = useContext(ConfirmSheetContext);
  return context;
};
