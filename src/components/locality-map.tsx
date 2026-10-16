"use client";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import type { EventItem, Player, PlayingSpot } from "@/lib/types";

type LocalityMapProps = {
  players: Player[];
  spots: PlayingSpot[];
  events: EventItem[];
  center: { lat: number; lng: number };
};

export function LocalityMap({ players, spots, events, center }: LocalityMapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      scrollWheelZoom
      className="h-[24rem] w-full rounded-2xl border border-slate-200"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {players.map((player) => (
        <CircleMarker
          key={`player-${player.id}`}
          center={[player.latitude, player.longitude]}
          radius={8}
          pathOptions={{ color: "#0ea5e9", fillColor: "#38bdf8", fillOpacity: 0.75 }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            {player.name}
          </Tooltip>
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{player.name}</p>
              <p>{player.sports}</p>
              <p>{player.area}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {spots.map((spot) => (
        <CircleMarker
          key={`spot-${spot.id}`}
          center={[spot.latitude, spot.longitude]}
          radius={10}
          pathOptions={{ color: "#22c55e", fillColor: "#4ade80", fillOpacity: 0.8 }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            {spot.name}
          </Tooltip>
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{spot.name}</p>
              <p>{spot.sport}</p>
              <p>{spot.address}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {events.map((event) => (
        <CircleMarker
          key={`event-${event.id}`}
          center={[event.spotLatitude, event.spotLongitude]}
          radius={13}
          pathOptions={{ color: "#f97316", fillColor: "#fb923c", fillOpacity: 0.35 }}
        >
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{event.title}</p>
              <p>{event.sport}</p>
              <p>Host: {event.hostName}</p>
              <p>Spot: {event.spotName}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
