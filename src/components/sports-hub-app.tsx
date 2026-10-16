"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, type FormEvent } from "react";
import type { EventItem, HomePayload, JoinRequestItem, Player, PlayingSpot } from "@/lib/types";

const LocalityMap = dynamic(
  () => import("@/components/locality-map").then((mod) => mod.LocalityMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[24rem] w-full animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
    ),
  },
);

type LocationValue = { lat: number; lng: number };

function haversineKm(a: LocationValue, b: LocationValue) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latDiff = toRad(b.lat - a.lat);
  const lngDiff = toRad(b.lng - a.lng);
  const x =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function SportsHubApp({ initialData }: { initialData: HomePayload }) {
  const [players, setPlayers] = useState<Player[]>(initialData.players);
  const [spots, setSpots] = useState<PlayingSpot[]>(initialData.spots);
  const [events, setEvents] = useState<EventItem[]>(initialData.events);
  const [joinRequests, setJoinRequests] = useState<JoinRequestItem[]>(initialData.joinRequests);

  const [notice, setNotice] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [filterArea, setFilterArea] = useState("");
  const [filterSport, setFilterSport] = useState("");

  const [viewerLocation, setViewerLocation] = useState<LocationValue>({ lat: 40.7128, lng: -74.006 });

  const [profileForm, setProfileForm] = useState({
    name: "",
    sports: "",
    area: "",
    bio: "",
    latitude: 40.7128,
    longitude: -74.006,
    lookingForGame: true,
  });

  const [spotForm, setSpotForm] = useState({
    name: "",
    sport: "",
    area: "",
    address: "",
    latitude: 40.7128,
    longitude: -74.006,
    createdByPlayerId: "",
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    sport: "",
    description: "",
    startTime: "",
    maxPlayers: 10,
    hostPlayerId: "",
    spotId: "",
  });

  const [requestForm, setRequestForm] = useState({
    eventId: "",
    playerId: "",
    message: "I would love to join this game!",
  });

  async function refreshData() {
    const [playersRes, spotsRes, eventsRes, requestsRes] = await Promise.all([
      fetch("/api/players", { cache: "no-store" }),
      fetch("/api/spots", { cache: "no-store" }),
      fetch("/api/events", { cache: "no-store" }),
      fetch("/api/join-requests", { cache: "no-store" }),
    ]);

    if (!playersRes.ok || !spotsRes.ok || !eventsRes.ok || !requestsRes.ok) {
      throw new Error("Failed to refresh data.");
    }

    setPlayers(await playersRes.json());
    setSpots(await spotsRes.json());
    setEvents(await eventsRes.json());
    setJoinRequests(await requestsRes.json());
  }

  function captureBrowserLocation(
    onSuccess: (value: LocationValue) => void,
    onErrorMessage: string,
  ) {
    if (!navigator.geolocation) {
      setNotice("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onSuccess({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        setNotice(onErrorMessage);
      },
      { enableHighAccuracy: true },
    );
  }

  async function handleCreateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      if (!response.ok) {
        throw new Error("Could not create profile.");
      }

      setNotice("Profile created and visible on the map.");
      setProfileForm((prev) => ({ ...prev, name: "", sports: "", area: "", bio: "" }));
      await refreshData();
    } catch {
      setNotice("Failed to create profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSpot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...spotForm,
          createdByPlayerId: spotForm.createdByPlayerId ? Number(spotForm.createdByPlayerId) : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not create spot.");
      }

      setNotice("Playing spot added.");
      setSpotForm((prev) => ({ ...prev, name: "", sport: "", area: "", address: "" }));
      await refreshData();
    } catch {
      setNotice("Failed to create playing spot.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...eventForm,
          hostPlayerId: Number(eventForm.hostPlayerId),
          spotId: Number(eventForm.spotId),
          maxPlayers: Number(eventForm.maxPlayers),
        }),
      });

      if (!response.ok) {
        throw new Error("Could not create event.");
      }

      setNotice("Event created successfully.");
      setEventForm((prev) => ({ ...prev, title: "", sport: "", description: "", startTime: "" }));
      await refreshData();
    } catch {
      setNotice("Failed to create event.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/join-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: Number(requestForm.eventId),
          playerId: Number(requestForm.playerId),
          message: requestForm.message,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not request.");
      }

      setNotice("Join request sent to the event host.");
      await refreshData();
    } catch {
      setNotice("Failed to send join request.");
    } finally {
      setLoading(false);
    }
  }

  const filteredPlayers = useMemo(() => {
    const byAreaAndSport = players.filter((player) => {
      const areaMatch = filterArea
        ? player.area.toLowerCase().includes(filterArea.toLowerCase())
        : true;
      const sportMatch = filterSport
        ? player.sports.toLowerCase().includes(filterSport.toLowerCase())
        : true;
      return areaMatch && sportMatch;
    });

    return byAreaAndSport
      .map((player) => ({
        ...player,
        distanceKm: haversineKm(viewerLocation, { lat: player.latitude, lng: player.longitude }),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [players, filterArea, filterSport, viewerLocation]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-sky-600 to-indigo-600 p-6 text-white shadow-lg md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">PlayLocal Sports Social</h1>
          <p className="mt-3 max-w-3xl text-sm text-sky-50 md:text-base">
            Find players near your exact locality, create games at real playing spots, and request
            teammates instantly.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() =>
                captureBrowserLocation(
                  (loc) => {
                    setViewerLocation(loc);
                    setNotice("Location detected. Nearby players are now sorted by distance.");
                  },
                  "Could not capture your location.",
                )
              }
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-sky-700"
            >
              Use My Precise Location
            </button>
            <input
              placeholder="Filter by locality"
              className="rounded-xl border border-white/50 bg-white/90 px-3 py-2 text-sm text-slate-800"
              value={filterArea}
              onChange={(event) => setFilterArea(event.target.value)}
            />
            <input
              placeholder="Filter by sport"
              className="rounded-xl border border-white/50 bg-white/90 px-3 py-2 text-sm text-slate-800"
              value={filterSport}
              onChange={(event) => setFilterSport(event.target.value)}
            />
          </div>
          {notice ? <p className="mt-3 text-sm text-sky-100">{notice}</p> : null}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.4fr]">
          <div className="space-y-6">
            <form onSubmit={handleCreateProfile} className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">1) Create Player Profile</h2>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  required
                  placeholder="Name"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={profileForm.name}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <input
                  required
                  placeholder="Sports (e.g. football, cricket)"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={profileForm.sports}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, sports: event.target.value }))
                  }
                />
                <input
                  required
                  placeholder="Local area"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={profileForm.area}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, area: event.target.value }))}
                />
                <input
                  placeholder="Bio"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={profileForm.bio}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, bio: event.target.value }))}
                />
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Latitude"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={profileForm.latitude}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, latitude: Number(event.target.value) }))
                  }
                />
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Longitude"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={profileForm.longitude}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, longitude: Number(event.target.value) }))
                  }
                />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    captureBrowserLocation(
                      (loc) =>
                        setProfileForm((prev) => ({ ...prev, latitude: loc.lat, longitude: loc.lng })),
                      "Unable to read your location for profile.",
                    )
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Auto-fill location
                </button>
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={profileForm.lookingForGame}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, lookingForGame: event.target.checked }))
                    }
                  />
                  Looking for game
                </label>
                <button
                  disabled={loading}
                  className="ml-auto rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Save Profile
                </button>
              </div>
            </form>

            <form onSubmit={handleCreateSpot} className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">2) Add Playing Spot</h2>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  required
                  placeholder="Spot name"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={spotForm.name}
                  onChange={(event) => setSpotForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <input
                  required
                  placeholder="Sport"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={spotForm.sport}
                  onChange={(event) => setSpotForm((prev) => ({ ...prev, sport: event.target.value }))}
                />
                <input
                  required
                  placeholder="Area"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={spotForm.area}
                  onChange={(event) => setSpotForm((prev) => ({ ...prev, area: event.target.value }))}
                />
                <input
                  required
                  placeholder="Address"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={spotForm.address}
                  onChange={(event) => setSpotForm((prev) => ({ ...prev, address: event.target.value }))}
                />
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Latitude"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={spotForm.latitude}
                  onChange={(event) => setSpotForm((prev) => ({ ...prev, latitude: Number(event.target.value) }))}
                />
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Longitude"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={spotForm.longitude}
                  onChange={(event) => setSpotForm((prev) => ({ ...prev, longitude: Number(event.target.value) }))}
                />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                  onClick={() =>
                    captureBrowserLocation(
                      (loc) => setSpotForm((prev) => ({ ...prev, latitude: loc.lat, longitude: loc.lng })),
                      "Unable to read your location for spot.",
                    )
                  }
                >
                  Auto-fill location
                </button>
                <select
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  value={spotForm.createdByPlayerId}
                  onChange={(event) =>
                    setSpotForm((prev) => ({ ...prev, createdByPlayerId: event.target.value }))
                  }
                >
                  <option value="">Created by (optional)</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
                <button
                  disabled={loading}
                  className="ml-auto rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Add Spot
                </button>
              </div>
            </form>

            <form onSubmit={handleCreateEvent} className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">3) Create Event</h2>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  required
                  placeholder="Event title"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={eventForm.title}
                  onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))}
                />
                <input
                  required
                  placeholder="Sport"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={eventForm.sport}
                  onChange={(event) => setEventForm((prev) => ({ ...prev, sport: event.target.value }))}
                />
                <input
                  type="datetime-local"
                  required
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={eventForm.startTime}
                  onChange={(event) =>
                    setEventForm((prev) => ({ ...prev, startTime: event.target.value }))
                  }
                />
                <input
                  type="number"
                  min={2}
                  required
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={eventForm.maxPlayers}
                  onChange={(event) =>
                    setEventForm((prev) => ({ ...prev, maxPlayers: Number(event.target.value) }))
                  }
                />
                <select
                  required
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={eventForm.hostPlayerId}
                  onChange={(event) =>
                    setEventForm((prev) => ({ ...prev, hostPlayerId: event.target.value }))
                  }
                >
                  <option value="">Select host player</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
                <select
                  required
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={eventForm.spotId}
                  onChange={(event) => setEventForm((prev) => ({ ...prev, spotId: event.target.value }))}
                >
                  <option value="">Select playing spot</option>
                  {spots.map((spot) => (
                    <option key={spot.id} value={spot.id}>
                      {spot.name} ({spot.area})
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Details about the game"
                  className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={eventForm.description}
                  onChange={(event) =>
                    setEventForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </div>
              <button
                disabled={loading}
                className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Publish Event
              </button>
            </form>

            <form onSubmit={handleJoinRequest} className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">4) Request to Join</h2>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <select
                  required
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={requestForm.playerId}
                  onChange={(event) =>
                    setRequestForm((prev) => ({ ...prev, playerId: event.target.value }))
                  }
                >
                  <option value="">Select requesting player</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
                <select
                  required
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={requestForm.eventId}
                  onChange={(event) => setRequestForm((prev) => ({ ...prev, eventId: event.target.value }))}
                >
                  <option value="">Select event</option>
                  {events.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} - {item.spotName}
                    </option>
                  ))}
                </select>
                <textarea
                  className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={requestForm.message}
                  onChange={(event) => setRequestForm((prev) => ({ ...prev, message: event.target.value }))}
                />
              </div>
              <button
                disabled={loading}
                className="mt-3 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Send Request
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Locality Map</h2>
              <p className="mt-1 text-sm text-slate-600">
                Blue: players • Green: playing spots • Orange: active event spots
              </p>
              <div className="mt-3">
                <LocalityMap players={players} spots={spots} events={events} center={viewerLocation} />
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Nearby Players</h2>
              <div className="mt-3 space-y-3">
                {filteredPlayers.length === 0 ? (
                  <p className="text-sm text-slate-500">No players found for your filters.</p>
                ) : (
                  filteredPlayers.map((player) => (
                    <article key={player.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">{player.name}</p>
                          <p className="text-xs text-slate-600">{player.area}</p>
                          <p className="text-xs text-slate-600">{player.sports}</p>
                        </div>
                        <p className="text-xs font-semibold text-sky-700">{player.distanceKm.toFixed(2)} km</p>
                      </div>
                      <p className="mt-2 text-xs text-slate-700">{player.bio || "No bio added yet."}</p>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Upcoming Events</h2>
              <div className="mt-3 space-y-3">
                {events.length === 0 ? (
                  <p className="text-sm text-slate-500">No events yet. Create one now.</p>
                ) : (
                  events.map((event) => (
                    <article key={event.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">{event.title}</p>
                        <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                          {event.sport}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">Host: {event.hostName}</p>
                      <p className="text-xs text-slate-600">Spot: {event.spotName} ({event.spotArea})</p>
                      <p className="text-xs text-slate-600">
                        Starts: {new Date(event.startTime).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-600">
                        Requests: {event.requestCount} / Max Players: {event.maxPlayers}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Recent Join Requests</h2>
              <div className="mt-3 space-y-3">
                {joinRequests.length === 0 ? (
                  <p className="text-sm text-slate-500">No requests yet.</p>
                ) : (
                  joinRequests.slice(0, 8).map((item) => (
                    <article key={item.id} className="rounded-xl border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900">{item.playerName} → {item.eventTitle}</p>
                      <p className="mt-1 text-xs text-slate-700">{item.message}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-violet-700">{item.status}</p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
