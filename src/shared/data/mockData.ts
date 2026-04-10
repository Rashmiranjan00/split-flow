import { User } from '@/shared/types';

/**
 * MOCK_CURRENT_USER and other static data have been removed.
 * Data is now managed via Zustand stores in features/store.
 */

export const MOCK_MEMBERS: User[] = [];
export const MOCK_GROUPS: any[] = [];
export const MOCK_EXPENSES: any[] = [];
export const GROUP_MAP = new Map();
export const MEMBER_MAP = new Map();
export const MOCK_CURRENT_USER: any = null;
