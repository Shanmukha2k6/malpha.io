export enum MediaType {
  PROFILE = 'PROFILE',
  REEL = 'REEL',
  AUDIO = 'AUDIO',
  IMAGE = 'IMAGE',
  UNKNOWN = 'UNKNOWN'
}

export interface InstagramStats {
  followers?: string;
  following?: string;
  posts?: string;
  likes?: string;
  views?: string;
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface MediaData {
  id: string;
  type: MediaType;
  username: string;
  fullName?: string;
  avatarUrl: string; // Placeholder or actual if possible
  mediaUrl: string; // Placeholder for download
  mirrorUrl?: string; // URL to a public viewer (Imginn, Picuki, etc.)
  caption: string;
  thumbnailUrl: string;
  stats: InstagramStats;
  hashtags: string[];
  timestamp: string;
  sources?: WebSource[];
}

export interface AnalyzeResponse {
  success: boolean;
  data?: MediaData;
  error?: string;
}

export interface HistoryItem extends MediaData {
  downloadedAt: number;
}