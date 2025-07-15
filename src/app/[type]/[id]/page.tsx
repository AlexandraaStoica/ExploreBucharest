"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "components/ui/button";
import { useUser } from "@clerk/nextjs";
import { Heart } from "lucide-react";

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
  const { isSignedIn, user } = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buying, setBuying] = useState(false);
  const [buySuccess, setBuySuccess] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [wishlistItem, setWishlistItem] = useState<any>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);

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

  // Fetch reviews
  useEffect(() => {
    async function fetchReviews() {
      setReviewsLoading(true);
      const res = await fetch(`/api/reviews?targetId=${id}`);
      if (res.ok) {
        setReviews(await res.json());
      } else {
        setReviews([]);
      }
      setReviewsLoading(false);
    }
    if (id) fetchReviews();
  }, [id]);

  // Fetch wishlist status for this item
  useEffect(() => {
    async function fetchWishlist() {
      if (!isSignedIn) return setWishlistItem(null);
      setWishlistLoading(true);
      const res = await fetch(`/api/wishlist?targetType=${type}&targetId=${id}`);
      if (res.ok) {
        const items = await res.json();
        setWishlistItem(items.find((w: any) => w.targetId === id) || null);
      } else {
        setWishlistItem(null);
      }
      setWishlistLoading(false);
    }
    if (id && type && isSignedIn) fetchWishlist();
  }, [id, type, isSignedIn]);

  async function toggleWishlist() {
    if (!isSignedIn) return;
    setWishlistLoading(true);
    if (wishlistItem) {
      // Remove from wishlist
      await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: type, targetId: id })
      });
      setWishlistItem(null);
    } else {
      // Add to wishlist
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: type, targetId: id })
      });
      setWishlistItem(res.ok ? await res.json() : null);
    }
    setWishlistLoading(false);
  }

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

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    setReviewError("");
    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: id, rating: reviewRating, comment: reviewText })
      });
      if (!res.ok) {
        const err = await res.json();
        setReviewError(err.error || "Failed to submit review.");
      } else {
        setReviewText("");
        setReviewRating(0);
        // Refresh reviews
        const reviewsRes = await fetch(`/api/reviews?targetId=${id}`);
        setReviews(reviewsRes.ok ? await reviewsRes.json() : []);
      }
    } catch {
      setReviewError("Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-burgundy text-xl">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-700 text-xl">{error}</div>;
  if (!data) return null;

  // Extract lat/lng for map
  const lat = parseFloat(data.latitude || data.lat);
  const lng = parseFloat(data.longitude || data.lng);

  return (
    <div className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-8">
          {data.imageUrl && (
            <img src={data.imageUrl} alt={data.title || data.name} className="w-full h-64 object-cover rounded mb-6" />
          )}
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-burgundy font-display">{data.title || data.name}</h1>
            {isSignedIn && (
              <button
                className="ml-2"
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                aria-label={wishlistItem ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={wishlistItem ? "text-red-500 fill-red-500" : "text-gray-400"}
                  fill={wishlistItem ? "currentColor" : "none"}
                  strokeWidth={2}
                  size={28}
                />
              </button>
            )}
          </div>
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
          {/* Reviews Section */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-burgundy font-display mb-4">Reviews</h2>
            {reviewsLoading ? (
              <div className="text-burgundy">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="text-burgundy/70">No reviews yet.</div>
            ) : (
              <ul className="space-y-4 mb-6">
                {reviews.map((r) => (
                  <li key={r.id} className="border-b pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-burgundy">{r.rating}★</span>
                      <span className="text-gray-600 text-sm">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-gray-800">{r.comment}</div>
                  </li>
                ))}
              </ul>
            )}
            {isSignedIn && (
              <form onSubmit={handleReviewSubmit} className="bg-cream rounded-lg p-4 mb-2">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-semibold text-burgundy">Your Rating:</span>
                  {[1,2,3,4,5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={star <= reviewRating ? "text-yellow-500" : "text-gray-300"}
                      onClick={() => setReviewRating(star)}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Write your review..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows={3}
                  required
                />
                {reviewError && <div className="text-red-600 mb-2">{reviewError}</div>}
                <Button type="submit" className="bg-burgundy text-white" disabled={reviewSubmitting || reviewRating === 0}>
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            )}
          </div>
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