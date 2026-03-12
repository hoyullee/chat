export interface Emoticon { id: string; name: string; filename: string; tags: string[]; }
export interface EmoticonPack { id: string; name: string; author: string; version: string; description: string; license: 'free' | 'paid' | 'custom'; images: string[]; emoticons: Emoticon[]; }
export interface EmoticonManifest { version: string; packs: EmoticonPack[]; updatedAt: string; }
