"use client";

import { useMemo, useState } from "react";
import type { EventItem } from "@/lib/types";

type Props = {
  events: EventItem[];
};

type Coord = { lat: number; lng: number };

function haversineKm(a: Coord, b: Coord) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latDiff = toRad(b.lat - a.lat);
  const lngDiff = toRad(b.lng - a.lng);
  const x =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function NearbyEventsPanel({ events }: Props) {
  const [radiusKm, setRadiusKm] = useState(10);
  const [notice, setNotice] = useState("");
  const [myLocation, setMyLocation] = useState<Coord>({ lat: 40.7128, lng: -74.006 });

  function detectLocation() {
    if (!navigator.geolocation) {
      setNotice("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMyLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setNotice("Showing nearby matches around your location.");
      },
      () => setNotice("Unable to detect location."),
      { enableHighAccuracy: true },
    );
  }

  const nearby = useMemo(() => {
    return events
      .map((event) => ({
        ...event,
        distanceKm: haversineKm(myLocation, { lat: event.spotLatitude, lng: event.spotLongitude }),
      }))
      .filter((event) => event.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 6);
  }, [events, myLocation, radiusKm]);

  return (
    <section className="rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">Nearby Matches</h2>
        <button onClick={detectLocation} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
          Use My Location
        </button>
        <label className="ml-auto flex items-center gap-2 text-xs text-slate-600">
          Radius
          <input
            type="number"
            min={1}
            value={radiusKm}
            onChange={(event) => setRadiusKm(Number(event.target.value) || 1)}
            className="w-20 rounded-md border border-slate-300 px-2 py-1"
          />
          km
        </label>
      </div>
      {notice ? <p className="mt-2 text-sm text-slate-600">{notice}</p> : null}

      <div className="mt-4 space-y-3">
        {nearby.length === 0 ? (
          <p className="text-sm text-slate-500">No nearby events in selected radius.</p>
        ) : (
          nearby.map((event) => (
            <article key={event.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{event.title}</p>
                <span className="text-xs font-semibold text-cyan-700">{event.distanceKm.toFixed(2)} km</span>
              </div>
              <p className="text-xs text-slate-600">{event.spotName} · {event.spotArea}</p>
              <p className="text-xs text-slate-600">{new Date(event.startTime).toLocaleString()}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
