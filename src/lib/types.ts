export type Player = {
  id: number;
  userId: number | null;
  name: string;
  sports: string;
  area: string;
  bio: string;
  latitude: number;
  longitude: number;
  lookingForGame: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlayingSpot = {
  id: number;
  name: string;
  sport: string;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
  createdByPlayerId: number | null;
  createdAt: string;
};

export type EventItem = {
  id: number;
  title: string;
  sport: string;
  description: string;
  startTime: string;
  maxPlayers: number;
  hostPlayerId: number;
  hostName: string;
  spotId: number;
  spotName: string;
  spotArea: string;
  spotLatitude: number;
  spotLongitude: number;
  requestCount: number;
  createdAt: string;
};

export type JoinRequestItem = {
  id: number;
  eventId: number;
  eventTitle: string;
  playerId: number;
  playerName: string;
  message: string;
  status: string;
  createdAt: string;
};

export type GroupItem = {
  id: number;
  name: string;
  sport: string;
  area: string;
  description: string;
  latitude: number;
  longitude: number;
  createdByPlayerId: number;
  createdByPlayerName: string;
  createdAt: string;
};

export type AppUser = {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
};

export type Viewer = {
  user: AppUser;
  player: Player | null;
} | null;

export type HomePayload = {
  players: Player[];
  spots: PlayingSpot[];
  events: EventItem[];
  joinRequests: JoinRequestItem[];
  groups: GroupItem[];
};
