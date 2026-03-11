export type FriendStatus = 'pending' | 'accepted' | 'blocked';
export interface Friend { id: string; requesterId: string; addresseeId: string; status: FriendStatus; createdAt: string; }
export interface FriendRequest { addresseeId: string; }
