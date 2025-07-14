"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "components/ui/card"
import { Button } from "components/ui/button"
import { Calendar, MapPin, Star, Search, Activity, Building, Utensils, Music } from "lucide-react"

interface Event {
  id: string
  title: string
  description: string | null
  startDatetime: string
  endDatetime: string
  locationId: string
  mainCategory: string
  subCategory: string
  imageUrl: string | null
  price: string
  capacity: number | null
  createdAt: string
}

interface Location {
  id: string
  name: string
  description: string | null
  address: string
  latitude: string
  longitude: string
  imageUrl: string | null
  category?: string | null // for future-proofing
}

const categoryKeywords: Record<string, string[]> = {
  all: [],
  events: ["event", "festival", "concert", "show"],
  activities: ["activity", "escape", "tour", "workshop"],
  culture: ["museum", "gallery", "monument", "culture"],
  "food&drink": ["restaurant", "cafe", "bar", "food", "drink"],
  nightlife: ["nightlife", "club", "music", "night"],
}

// Use unified categories from the DB enums
const categories = [
  { key: "all", label: "Search All", icon: <Search className="w-4 h-4 mr-2" /> },
  { key: "events", label: "Events", icon: <Calendar className="w-4 h-4 mr-2" /> },
  { key: "activities", label: "Activities", icon: <Activity className="w-4 h-4 mr-2" /> },
  { key: "food&drink", label: "Food & Drink", icon: <Utensils className="w-4 h-4 mr-2" /> },
  { key: "nightlife", label: "Nightlife", icon: <Music className="w-4 h-4 mr-2" /> },
  { key: "culture", label: "Culture", icon: <Building className="w-4 h-4 mr-2" /> },
];

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [eventsData, locationsData] = await Promise.all([
        fetch("/api/events").then((res) => res.json()),
        fetch("/api/locations").then((res) => res.json()),
      ])
      setEvents(Array.isArray(eventsData) ? eventsData : [])
      setLocations(Array.isArray(locationsData) ? locationsData : [])
      setLoading(false)
    }
    fetchData()
  }, [])

  // Update URL when search or category changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategory) params.set("category", selectedCategory)
    if (searchTerm) params.set("q", searchTerm)
    router.replace(`/search?${params.toString()}`)
    // eslint-disable-next-line
  }, [searchTerm, selectedCategory])

  // Filter locations by category (using the actual category field)
  function filterLocations() {
    if (selectedCategory === "all") return locations;
    if (selectedCategory === "culture") return locations.filter(loc => loc.category?.toLowerCase() === "cultural");
    return locations.filter(loc => loc.category?.toLowerCase() === selectedCategory);
  }

  // Unified filter for both locations and events
  function matchesCategory(item: { mainCategory?: string | null; category?: string | null }) {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "culture") {
      if ("mainCategory" in item && item.mainCategory) {
        return item.mainCategory.toLowerCase() === "culture";
      }
      if ("category" in item && item.category) {
        return item.category.toLowerCase() === "cultural";
      }
      return false;
    }
    if ("mainCategory" in item && item.mainCategory) {
      return item.mainCategory.toLowerCase() === selectedCategory;
    }
    if ("category" in item && item.category) {
      return item.category.toLowerCase() === selectedCategory;
    }
    return false;
  }
  function matchesSearch(item: { name?: string | null; title?: string | null }) {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.title && item.title.toLowerCase().includes(term))
    );
  }
  // Filtered locations and events
  let filteredLocations: Location[] = [];
  let filteredEvents: Event[] = [];
  if (selectedCategory === "events") {
    filteredEvents = events.filter(ev => matchesSearch(ev));
    filteredLocations = locations.filter(loc => matchesSearch(loc));
  } else {
    filteredEvents = events.filter(ev => matchesCategory(ev) && matchesSearch(ev));
    filteredLocations = locations.filter(loc => matchesCategory(loc) && matchesSearch(loc));
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Search bar and categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {categories.map(cat => (
              <Button
                key={cat.key}
                className={`${selectedCategory === cat.key ? "bg-burgundy text-white ring-2 ring-burgundy" : "bg-white text-burgundy border-burgundy/20"}`}
                variant={selectedCategory === cat.key ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.key)}
              >
                {cat.icon}
                {cat.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for anything in Bucharest..."
                className="pl-10 py-3 text-lg border rounded-lg border-burgundy/20 focus:ring-burgundy w-full"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="bg-burgundy hover:bg-burgundy/90 px-8" onClick={() => router.replace(`/search?category=${selectedCategory}&q=${encodeURIComponent(searchTerm)}`)}>Search</Button>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-burgundy font-display mb-8">Search Results</h1>
        {loading ? (
          <div className="text-burgundy text-lg">Loading...</div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-burgundy font-display mb-4">Locations</h2>
            {filteredLocations.length === 0 && <div className="text-burgundy/70 mb-8">No locations found.</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredLocations.map(location => (
                <a key={location.id} href={`/location/${location.id}`} target="_blank" rel="noopener noreferrer">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                    <div className="aspect-video bg-gray-200 relative">
                      <img
                        src={location.imageUrl || "/placeholder.svg?height=200&width=300&query=bucharest+landmark"}
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">4.7</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-burgundy mb-2 font-display">{location.name}</h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{location.address}</span>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{location.description}</p>
                    <Button
                      variant="outline"
                      className="w-full border-burgundy text-burgundy hover:bg-burgundy/5 bg-transparent"
                    >
                      Learn More
                    </Button>
                  </Card>
                </a>
              ))}
            </div>
            <h2 className="text-2xl font-bold text-burgundy font-display mb-4">Events</h2>
            {filteredEvents.length === 0 && <div className="text-burgundy/70 mb-8">No events found.</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <a key={event.id} href={`/event/${event.id}`} target="_blank" rel="noopener noreferrer">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                    <div className="aspect-video bg-gray-200 relative">
                      <img
                        src={event.imageUrl || "/placeholder.svg?height=200&width=300&query=event"}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-burgundy text-white px-3 py-1 rounded-full text-sm">{event.subCategory}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-burgundy mb-2 font-display">{event.title}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(event.startDatetime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Location</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-burgundy text-burgundy hover:bg-burgundy/5 bg-transparent"
                    >
                      Learn More
                    </Button>
                  </Card>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 