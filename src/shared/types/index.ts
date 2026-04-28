export type UserId = string;

export interface User {
  id: UserId;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: UserId[];
  createdAt: string;
  coverImage?: string;
}

export interface SplitDetail {
  userId: UserId;
  owedAmount: number;
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  paidBy: UserId;
  participants: UserId[];
  splitDetails: SplitDetail[];
  createdAt: string;
  category?: string;
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';
}

export interface Settlement {
  id: string;
  groupId: string;
  from: UserId;
  to: UserId;
  amount: number;
  createdAt: string;
}

export interface Balance {
  from: UserId;
  to: UserId;
  amount: number;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  addedAt: string;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendRequest {
  id: string;
  fromUser: UserId;
  toUser: UserId;
  status: FriendRequestStatus;
  createdAt: string;
  respondedAt?: string;
}

/** A friend request joined with the counterparty's profile. */
export interface FriendRequestWithProfile extends FriendRequest {
  profile: User;
}
