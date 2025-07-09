"use client"

import { Calendar, MapPin, Star, Search, Activity, Building, Utensils, Music } from "lucide-react"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Card, CardContent } from "components/ui/card"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"

interface Event {
  id: string
  title: string
  description: string | null
  startDatetime: string
  endDatetime: string
  locationId: string
  category: string
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
}

export default function HomePage() {
  const { isSignedIn } = useUser()
  const [events, setEvents] = useState<Event[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsData, locationsData] = await Promise.all([
          fetch("/api/events").then((res) => res.json()),
          fetch("/api/locations").then((res) => res.json()),
        ])
        setEvents(eventsData || [])
        setLocations(locationsData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setEvents([])
        setLocations([])
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-cream px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-burgundy font-display">BucharEst</h1>
          <p className="text-sm text-burgundy/70">Explorer</p>
        </div>

        {!isSignedIn ? (
          <div className="flex gap-3">
            <SignInButton mode="modal">
              <Button variant="outline" className="border-burgundy text-burgundy hover:bg-burgundy/5 bg-transparent">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="bg-burgundy hover:bg-burgundy/90 text-white">Sign Up</Button>
            </SignUpButton>
          </div>
        ) : (
          <UserButton afterSignOutUrl="/" />
        )}
      </header>

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
      <section className="bg-cream px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button className="bg-burgundy hover:bg-burgundy/90">
              <Search className="w-4 h-4 mr-2" />
              Search All
            </Button>
            <Button variant="outline" className="border-burgundy/20 text-burgundy hover:bg-burgundy/5 bg-transparent">
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </Button>
            <Button variant="outline" className="border-burgundy/20 text-burgundy hover:bg-burgundy/5 bg-transparent">
              <Activity className="w-4 h-4 mr-2" />
              Activities
            </Button>
            <Button variant="outline" className="border-burgundy/20 text-burgundy hover:bg-burgundy/5 bg-transparent">
              <Building className="w-4 h-4 mr-2" />
              Culture
            </Button>
            <Button variant="outline" className="border-burgundy/20 text-burgundy hover:bg-burgundy/5 bg-transparent">
              <Utensils className="w-4 h-4 mr-2" />
              Food & Drink
            </Button>
            <Button variant="outline" className="border-burgundy/20 text-burgundy hover:bg-burgundy/5 bg-transparent">
              <Music className="w-4 h-4 mr-2" />
              Nightlife
            </Button>
          </div>

          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for anything in Bucharest..."
                className="pl-10 py-3 text-lg border-burgundy/20 focus:ring-burgundy"
              />
            </div>
            <Button className="bg-burgundy hover:bg-burgundy/90 px-8">Search</Button>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="px-6 py-12 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="bg-sage text-white border-0 hover:bg-sage/90 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <Calendar className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2 font-display">Events</h3>
                <p className="opacity-90">Concerts, shows, festivals</p>
              </CardContent>
            </Card>

            <Card className="bg-terracotta text-white border-0 hover:bg-terracotta/90 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <Activity className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2 font-display">Activities</h3>
                <p className="opacity-90">Escape rooms, tours, workshops</p>
              </CardContent>
            </Card>

            <Card className="bg-navy text-white border-0 hover:bg-navy/90 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <Building className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2 font-display">Culture</h3>
                <p className="opacity-90">Museums, galleries, monuments</p>
              </CardContent>
            </Card>

            <Card className="bg-mustard text-white border-0 hover:bg-mustard/90 transition-colors cursor-pointer">
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
            <Button variant="link" className="text-burgundy">
              View All Events
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 3).map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={event.imageUrl || "/placeholder.svg?height=200&width=300&query=event"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-burgundy text-white px-3 py-1 rounded-full text-sm">{event.category}</span>
                  </div>
                </div>
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Must-See Places */}
      <section className="px-6 py-12 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-burgundy font-display">Must-See Places in Bucharest</h2>
            <Button variant="link" className="text-burgundy">
              View All Places
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {locations.slice(0, 4).map((location) => (
              <Card key={location.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
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
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-gradient-to-r from-sage to-sage/90 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4 font-display">Do you have a question for us?</h2>
          <p className="text-white/80 mb-8">
            Submit your question below and we'll add it to our FAQ section to help other travelers.
          </p>

          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-left text-gray-700 mb-2">Your Name</label>
                <Input placeholder="John Doe" className="border-burgundy/20 focus:ring-burgundy" />
              </div>
              <div>
                <label className="block text-left text-gray-700 mb-2">Your Email</label>
                <Input placeholder="john@example.com" className="border-burgundy/20 focus:ring-burgundy" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-left text-gray-700 mb-2">Your Question</label>
              <textarea
                placeholder="Ask us anything..."
                className="w-full h-32 p-4 border border-burgundy/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-burgundy"
              />
            </div>
            <Button className="w-full bg-burgundy hover:bg-burgundy/90 text-white py-3">Submit Question</Button>
          </div>
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
                  <a href="#" className="hover:text-white">
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
