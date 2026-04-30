import {
  toUser,
  toGroup,
  toExpense,
  toSplitDetail,
  toSettlement,
  toFriendRequest,
  toCreateExpensePayload,
  toCreateSettlementPayload,
} from '../mappers';

describe('Supabase DTO mappers', () => {
  describe('toUser', () => {
    it('maps a profile row with avatar_url', () => {
      const row = {
        id: 'u1',
        name: 'Alice',
        email: 'alice@test.com',
        avatar_url: 'https://img.test/a.png',
        created_at: '2025-01-01T00:00:00Z',
      };
      expect(toUser(row)).toEqual({
        id: 'u1',
        name: 'Alice',
        email: 'alice@test.com',
        avatarUrl: 'https://img.test/a.png',
      });
    });

    it('maps a profile row with null avatar_url to undefined', () => {
      const row = {
        id: 'u2',
        name: 'Bob',
        email: 'bob@test.com',
        avatar_url: null,
        created_at: '2025-01-01T00:00:00Z',
      };
      expect(toUser(row)).toEqual({
        id: 'u2',
        name: 'Bob',
        email: 'bob@test.com',
        avatarUrl: undefined,
      });
    });
  });

  describe('toGroup', () => {
    it('maps a group row + member IDs', () => {
      const row = {
        id: 'g1',
        name: 'Trip',
        description: 'Summer trip',
        cover_image: null,
        created_by: 'u1',
        created_at: '2025-06-01T00:00:00Z',
      };
      expect(toGroup(row, ['u1', 'u2'])).toEqual({
        id: 'g1',
        name: 'Trip',
        description: 'Summer trip',
        members: ['u1', 'u2'],
        createdAt: '2025-06-01T00:00:00Z',
        coverImage: undefined,
      });
    });
  });

  describe('toExpense', () => {
    it('converts amount_minor and owed_minor to float dollars', () => {
      const row = {
        id: 'e1',
        group_id: 'g1',
        title: 'Dinner',
        amount_minor: 12050,
        paid_by: 'u1',
        split_type: 'EQUAL',
        category: 'Food',
        created_at: '2025-06-02T00:00:00Z',
      };
      const splits = [
        { expense_id: 'e1', user_id: 'u1', owed_minor: 6025 },
        { expense_id: 'e1', user_id: 'u2', owed_minor: 6025 },
      ];
      const result = toExpense(row, ['u1', 'u2'], splits);

      expect(result.amount).toBe(120.5);
      expect(result.splitDetails).toEqual([
        { userId: 'u1', owedAmount: 60.25 },
        { userId: 'u2', owedAmount: 60.25 },
      ]);
      expect(result.groupId).toBe('g1');
      expect(result.paidBy).toBe('u1');
      expect(result.splitType).toBe('EQUAL');
      expect(result.category).toBe('Food');
    });

    it('maps null category to undefined', () => {
      const row = {
        id: 'e2',
        group_id: 'g1',
        title: 'Taxi',
        amount_minor: 5000,
        paid_by: 'u2',
        split_type: 'EXACT',
        category: null,
        created_at: '2025-06-02T12:00:00Z',
      };
      expect(toExpense(row, ['u2'], []).category).toBeUndefined();
    });
  });

  describe('toSplitDetail', () => {
    it('converts owed_minor to owedAmount float', () => {
      expect(toSplitDetail({ expense_id: 'e1', user_id: 'u1', owed_minor: 3333 })).toEqual({
        userId: 'u1',
        owedAmount: 33.33,
      });
    });
  });

  describe('toSettlement', () => {
    it('maps from_user/to_user to from/to and converts amount', () => {
      const row = {
        id: 's1',
        group_id: 'g1',
        from_user: 'u2',
        to_user: 'u1',
        amount_minor: 6025,
        note: null,
        created_at: '2025-06-03T00:00:00Z',
      };
      expect(toSettlement(row)).toEqual({
        id: 's1',
        groupId: 'g1',
        from: 'u2',
        to: 'u1',
        amount: 60.25,
        createdAt: '2025-06-03T00:00:00Z',
      });
    });
  });

  describe('toCreateExpensePayload (reverse mapper)', () => {
    it('converts float dollars to integer minor units', () => {
      const payload = toCreateExpensePayload({
        groupId: 'g1',
        title: 'Groceries',
        amount: 45.99,
        paidBy: 'u1',
        splitType: 'EQUAL',
        participants: ['u1', 'u2'],
        splitDetails: [
          { userId: 'u1', owedAmount: 23.0 },
          { userId: 'u2', owedAmount: 22.99 },
        ],
      });

      expect(payload.p_amount_minor).toBe(4599);
      expect(payload.p_splits).toEqual([
        { userId: 'u1', owedMinor: 2300 },
        { userId: 'u2', owedMinor: 2299 },
      ]);
      expect(payload.p_category).toBeNull();
    });
  });

  describe('toCreateSettlementPayload (reverse mapper)', () => {
    it('converts float dollars to integer minor units', () => {
      const payload = toCreateSettlementPayload({
        groupId: 'g1',
        fromUser: 'u2',
        toUser: 'u1',
        amount: 60.25,
      });

      expect(payload).toEqual({
        group_id: 'g1',
        from_user: 'u2',
        to_user: 'u1',
        amount_minor: 6025,
      });
    });
  });

  describe('toFriendRequest', () => {
    it('maps a pending request row without responded_at', () => {
      const row = {
        id: 'fr1',
        from_user: 'u1',
        to_user: 'u2',
        status: 'pending' as const,
        created_at: '2025-06-01T00:00:00Z',
        responded_at: null,
      };
      expect(toFriendRequest(row)).toEqual({
        id: 'fr1',
        fromUser: 'u1',
        toUser: 'u2',
        status: 'pending',
        createdAt: '2025-06-01T00:00:00Z',
        respondedAt: undefined,
      });
    });

    it('maps an accepted request preserving responded_at', () => {
      const row = {
        id: 'fr2',
        from_user: 'u1',
        to_user: 'u2',
        status: 'accepted' as const,
        created_at: '2025-06-01T00:00:00Z',
        responded_at: '2025-06-02T00:00:00Z',
      };
      expect(toFriendRequest(row).status).toBe('accepted');
      expect(toFriendRequest(row).respondedAt).toBe('2025-06-02T00:00:00Z');
    });
  });
});
