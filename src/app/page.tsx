"use client"

import { Calendar, MapPin, Star, Search, Activity, Building, Utensils, Music } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent } from "../../components/ui/card"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

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
  category: string | null
}

export default function HomePage() {
  const { isSignedIn, user } = useUser()
  const [events, setEvents] = useState<Event[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [inputFocused, setInputFocused] = useState(false)
  const router = useRouter()
  const searchSectionRef = useRef<HTMLDivElement>(null);

  // Question form state
  const [qName, setQName] = useState(user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "");
  const [qEmail, setQEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
  const [qText, setQText] = useState("");
  const [qLoading, setQLoading] = useState(false);
  const [qSuccess, setQSuccess] = useState("");
  const [qError, setQError] = useState("");

  // Autofill name/email when user changes (e.g., after sign in)
  useEffect(() => {
    if (user) {
      setQName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
      setQEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [user]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsData, locationsData] = await Promise.all([
          fetch("/api/events").then((res) => res.json()),
          fetch("/api/locations").then((res) => res.json()),
        ])
        setEvents(Array.isArray(eventsData) ? eventsData : [])
        setLocations(Array.isArray(locationsData) ? locationsData : [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setEvents([])
        setLocations([])
      }
    }
    fetchData()
  }, [])

  // Use unified categories from the DB enums
  const categories = [
    { key: "all", label: "Search All", icon: <Search className="w-4 h-4 mr-2" /> },
    { key: "events", label: "Events", icon: <Calendar className="w-4 h-4 mr-2" /> },
    { key: "activities", label: "Activities", icon: <Activity className="w-4 h-4 mr-2" /> },
    { key: "food&drink", label: "Food & Drink", icon: <Utensils className="w-4 h-4 mr-2" /> },
    { key: "nightlife", label: "Nightlife", icon: <Music className="w-4 h-4 mr-2" /> },
    { key: "culture", label: "Culture", icon: <Building className="w-4 h-4 mr-2" /> },
  ];

  // Filter locations by category (using the actual category field)
  function filterLocations() {
    if (selectedCategory === "all") return locations;
    if (selectedCategory === "culture") return locations.filter(loc => loc.category?.toLowerCase() === "cultural");
    return locations.filter(loc => loc.category?.toLowerCase() === selectedCategory);
  }

  const filteredLocations = filterLocations().filter(loc =>
    searchTerm.trim() === "" ||
    loc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
  // Get matching locations and events for dropdown
  const matchingLocations = locations.filter(loc => matchesCategory(loc) && matchesSearch(loc));
  const matchingEvents = events.filter(ev => matchesCategory(ev) && matchesSearch(ev));
  const dropdownResults = [...matchingLocations.slice(0, 3), ...matchingEvents.slice(0, 3)].slice(0, 3);

  function handleSearchClick() {
    router.push(`/search?category=${selectedCategory}&q=${encodeURIComponent(searchTerm)}`)
    setInputFocused(false)
  }

  function handleSeeAll() {
    router.push(`/search?category=${selectedCategory}&q=${encodeURIComponent(searchTerm)}`)
    setInputFocused(false)
  }

  function handleCategoryCardClick(categoryKey: string) {
    router.push(`/search?category=${encodeURIComponent(categoryKey)}`);
  }

  async function handleQuestionSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQLoading(true);
    setQSuccess("");
    setQError("");
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: qName, email: qEmail, question: qText }),
      });
      if (res.ok) {
        setQSuccess("Thank you for your question! We'll add it to our FAQ soon.");
        setQName("");
        setQEmail("");
        setQText("");
      } else {
        const data = await res.json();
        setQError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setQError("Something went wrong. Please try again.");
    } finally {
      setQLoading(false);
    }
  }

  // Show dropdown if input is focused and searchTerm is not empty
  const showDropdown = inputFocused && searchTerm.trim() !== ""

  return (
    <div className="min-h-screen bg-cream">
      {/* Main Hero */}
      <section className="bg-gradient-to-r from-burgundy to-burgundy/90 text-white px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 font-display">Discover the Cultural Heart of Bucharest</h1>
          <p className="text-xl mb-8 opacity-90">
            Explore events, activities, historical sites, and the best food & drink spots in Romania's vibrant capital
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Plan my trip →
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-burgundy bg-transparent"
            >
              Explore Now
            </Button>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section ref={searchSectionRef} className="bg-cream px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center mb-8">
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

          <div className="flex gap-4 max-w-4xl mx-auto relative">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for anything in Bucharest..."
                className="pl-10 py-3 text-lg border-burgundy/20 focus:ring-burgundy"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 150)}
              />
              {/* Dropdown results */}
              {showDropdown && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-20 border border-burgundy/10 font-display text-burgundy">
                  {dropdownResults.length === 0 && (
                    <div className="px-4 py-3 text-burgundy/70">No results found</div>
                  )}
                  {dropdownResults.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3 hover:bg-burgundy/10 cursor-pointer border-b last:border-b-0 border-burgundy/10"
                      onMouseDown={() => {
                        setInputFocused(false)
                      }}
                    >
                      <span className="font-bold">{"name" in item ? item.name : item.title}</span>
                      <span className="block text-sm text-burgundy/70">{"address" in item ? item.address : "Event"}</span>
                    </div>
                  ))}
                  <div
                    className="px-4 py-3 hover:bg-burgundy/20 cursor-pointer text-center font-semibold text-burgundy border-t border-burgundy/10"
                    onMouseDown={handleSeeAll}
                  >
                    See all...
                  </div>
                </div>
              )}
            </div>
            <Button className="bg-burgundy hover:bg-burgundy/90 px-8" onClick={handleSearchClick}>Search</Button>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="px-6 py-12 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="bg-sage text-white border-0 hover:bg-sage/90 transition-colors cursor-pointer" onClick={() => handleCategoryCardClick("events")}>
              <CardContent className="p-6">
                <Calendar className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2 font-display">Events</h3>
                <p className="opacity-90">Concerts, shows, festivals</p>
              </CardContent>
            </Card>

            <Card className="bg-terracotta text-white border-0 hover:bg-terracotta/90 transition-colors cursor-pointer" onClick={() => handleCategoryCardClick("activities")}>
              <CardContent className="p-6">
                <Activity className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2 font-display">Activities</h3>
                <p className="opacity-90">Escape rooms, tours, workshops</p>
              </CardContent>
            </Card>

            <Card className="bg-navy text-white border-0 hover:bg-navy/90 transition-colors cursor-pointer" onClick={() => handleCategoryCardClick("culture")}>
              <CardContent className="p-6">
                <Building className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2 font-display">Culture</h3>
                <p className="opacity-90">Museums, galleries, monuments</p>
              </CardContent>
            </Card>

            <Card className="bg-mustard text-white border-0 hover:bg-mustard/90 transition-colors cursor-pointer" onClick={() => handleCategoryCardClick("food&drink")}>
              <CardContent className="p-6">
                <Utensils className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2 font-display">Food & Drink</h3>
                <p className="opacity-90">Restaurants, cafés, bars</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* This Week Events */}
      <section className="px-6 py-12 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-burgundy font-display">This Week in Bucharest</h2>
            <Button variant="link" className="text-burgundy" onClick={() => router.push('/search?sort=this-week')}>
              View All Events
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(events) ? events.slice(0, 3) : []).map((event) => (
              <a key={event.id} href={`/event/${event.id}`} target="_blank" rel="noopener noreferrer">
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white h-[32rem] flex flex-col">
                  <div className="w-full h-56 bg-gray-200 rounded-t-lg overflow-hidden flex items-center justify-center relative">
                    <img
                      src={event.imageUrl || "/placeholder.svg?height=200&width=300&query=event"}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-burgundy text-white px-3 py-1 rounded-full text-sm">{event.subCategory}</span>
                    </div>
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
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
                      className="w-full border-burgundy text-burgundy hover:bg-burgundy/5 bg-transparent mt-auto"
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Must-See Places */}
      <section className="px-6 py-12 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-burgundy font-display">Must-See Places in Bucharest</h2>
            <Button variant="link" className="text-burgundy" onClick={() => router.push('/search?sort=best-places')}>
              View All Places
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {locations.slice(0, 4).map((location) => (
              <a key={location.id} href={`/location/${location.id}`} target="_blank" rel="noopener noreferrer">
                <Card key={location.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white h-[32rem] flex flex-col">
                  <div className="w-full h-56 bg-gray-200 rounded-t-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={location.imageUrl || "/placeholder.svg?height=200&width=300&query=bucharest+landmark"}
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-burgundy mb-2 font-display">{location.name}</h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{location.address}</span>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2 flex-1">{location.description}</p>
                    <Button
                      variant="outline"
                      className="w-full border-burgundy text-burgundy hover:bg-burgundy/5 bg-transparent mt-auto"
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-sage">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4 font-display">Do you have a question for us?</h2>
          <p className="text-white/80 mb-8">
            Submit your question below and we'll add it to our FAQ section to help other travelers.
          </p>
          <form onSubmit={handleQuestionSubmit} className="bg-white rounded-lg p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-left text-gray-700 mb-2">Your Name</label>
                <Input value={qName} onChange={e => setQName(e.target.value)} placeholder="John Doe" className="border-burgundy/20 focus:ring-burgundy" required />
              </div>
              <div>
                <label className="block text-left text-gray-700 mb-2">Your Email</label>
                <Input value={qEmail} onChange={e => setQEmail(e.target.value)} placeholder="john@example.com" className="border-burgundy/20 focus:ring-burgundy" type="email" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-left text-gray-700 mb-2">Your Question</label>
              <textarea
                value={qText}
                onChange={e => setQText(e.target.value)}
                placeholder="Ask us anything..."
                className="w-full h-32 p-4 border border-burgundy/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-burgundy"
                required
              />
            </div>
            {qSuccess && <div className="mb-4 text-green-700 font-semibold">{qSuccess}</div>}
            {qError && <div className="mb-4 text-red-700 font-semibold">{qError}</div>}
            <Button type="submit" className="w-full bg-burgundy hover:bg-burgundy/90 text-white py-3" disabled={qLoading}>
              {qLoading ? "Submitting..." : "Submit Question"}
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-burgundy text-white px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 font-display">BucharEst</h3>
              <p className="text-white/80">Your guide to exploring the cultural heart of Romania's capital city.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a href="#" className="hover:text-white">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Activities
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Culture
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Food & Drink
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Nightlife
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Information</h4>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/faq" className="hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-white/80">
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" /> Bucharest, Romania
                </p>
                <p>+40 123 456 789</p>
                <p>info@bucharest-explorer.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/80">
            <p>&copy; 2025 BucharEst Explorer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
