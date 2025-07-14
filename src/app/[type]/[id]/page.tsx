"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

function GoogleMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  useEffect(() => {
    const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const mapId = "map-container";
    let map: any = null;
    let marker: any = null;

    function initMap() {
      const win = window as any;
      if (win.google && win.google.maps) {
        map = new win.google.maps.Map(document.getElementById(mapId), {
          center: { lat, lng },
          zoom: 15,
        });
        marker = new win.google.maps.Marker({ position: { lat, lng }, map, title });
      }
    }

    if (!(window as any).google || !(window as any).google.maps) {
      // Only add script if not already present
      const existingScript = document.getElementById("google-maps-script");
      if (!existingScript && GOOGLE_MAPS_API_KEY) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.onload = initMap;
        document.body.appendChild(script);
      } else if (existingScript) {
        existingScript.addEventListener("load", initMap);
      }
    } else {
      initMap();
    }
    // Clean up event listener
    return () => {
      if (document.getElementById("google-maps-script")) {
        document.getElementById("google-maps-script")?.removeEventListener("load", initMap);
      }
    };
  }, [lat, lng, title]);
  return (
    <div id="map-container" className="w-full h-[32rem] bg-gray-200 rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Loading map...</span>
    </div>
  );
}

export default function DetailsPage() {
  const params = useParams();
  const { type, id } = params as { type: string; id: string };
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buying, setBuying] = useState(false);
  const [buySuccess, setBuySuccess] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        let url = "";
        if (type === "event") url = `/api/events/${id}`;
        else if (type === "location") url = `/api/locations/${id}`;
        else throw new Error("Invalid type");
        const res = await fetch(url);
        if (!res.ok) throw new Error("Not found");
        const d = await res.json();
        setData(d);
      } catch (err) {
        setError("Could not load details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    if (id && type) fetchData();
  }, [id, type]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-burgundy text-xl">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-700 text-xl">{error}</div>;
  if (!data) return null;

  // Extract lat/lng for map
  const lat = parseFloat(data.latitude || data.lat);
  const lng = parseFloat(data.longitude || data.lng);

  async function handleBuyTicket() {
    setBuying(true);
    setBuySuccess(null);
    setBuyError(null);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: data.id, quantity: 1 }),
      });
      if (res.ok) {
        setBuySuccess("Ticket purchased! Check your profile for your ticket.");
      } else {
        const err = await res.json();
        setBuyError(err.error || "Failed to buy ticket.");
      }
    } catch {
      setBuyError("Failed to buy ticket.");
    } finally {
      setBuying(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-8">
          {data.imageUrl && (
            <img src={data.imageUrl} alt={data.title || data.name} className="w-full h-64 object-cover rounded mb-6" />
          )}
          <h1 className="text-4xl font-bold text-burgundy font-display mb-4">{data.title || data.name}</h1>
          {type === "event" && (
            <div className="flex flex-wrap gap-8 mb-4 text-burgundy/90">
              <div><span className="font-semibold">Date:</span> {new Date(data.startDatetime).toLocaleDateString()}</div>
              <div><span className="font-semibold">Time:</span> {new Date(data.startDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(data.endDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div><span className="font-semibold">Location:</span> {data.locationName || data.locationId}</div>
              <div><span className="font-semibold">Price:</span> {data.price === "0" ? "Free" : data.price}</div>
            </div>
          )}
          {type === "location" && (
            <div className="flex flex-wrap gap-8 mb-4 text-burgundy/90">
              <div><span className="font-semibold">Address:</span> {data.address}</div>
              <div><span className="font-semibold">Category:</span> {data.category}</div>
            </div>
          )}
          <h2 className="text-2xl font-bold text-burgundy font-display mb-2">About {type === "event" ? "Event" : "Location"}</h2>
          <p className="text-gray-700 mb-6">{data.description}</p>
          {type === "event" && (
            <>
              <button
                className="bg-burgundy text-white px-6 py-3 rounded-lg font-semibold mt-4"
                onClick={handleBuyTicket}
                disabled={buying}
              >
                {buying ? "Processing..." : "Buy Tickets"}
              </button>
              {buySuccess && <div className="text-green-700 mt-2">{buySuccess}</div>}
              {buyError && <div className="text-red-700 mt-2">{buyError}</div>}
            </>
          )}
        </div>
        {/* Map */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-2xl font-bold text-burgundy font-display mb-4">Location on Map</h2>
          {lat && lng ? (
            <>
              <GoogleMap lat={lat} lng={lng} title={data.title || data.name} />
              {data.address && (
                <div className="mt-4 text-burgundy/90 text-center">
                  <span className="font-semibold">Address:</span> {data.address}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              Interactive map will be available here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 