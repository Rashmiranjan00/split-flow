/**
 * Centralized React Query key factory — prevents key drift across hooks.
 */

export const queryKeys = {
  groups: ['groups'] as const,
  group: (id: string) => ['group', id] as const,
  expenses: (groupId: string) => ['expenses', groupId] as const,
  settlements: (groupId: string) => ['settlements', groupId] as const,
  friends: ['friends'] as const,
  profile: (id: string) => ['profile', id] as const,
};
