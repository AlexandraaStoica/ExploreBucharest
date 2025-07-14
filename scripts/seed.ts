import { db } from "../src/db/drizzle"
import { events, locations } from "../src/db/schema"
import { eq } from "drizzle-orm"
import dotenv from "dotenv";
dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

async function geocodeAddress(address: string): Promise<{ lat: string; lng: string } | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === "OK" && data.results && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      return { lat: String(loc.lat), lng: String(loc.lng) };
    }
    return null;
  } catch {
    return null;
  }
}

async function seed() {
  console.log("Seeding database...")

  // Add locations first
  const locationData: Array<{
    name: string;
    description: string;
    address: string;
    latitude: string;
    longitude: string;
    imageUrl: string;
    category: "cultural" | "food&drink" | "activities" | "nightlife";
  }> = [
    {
      name: "Palace of Parliament",
      description: "The world's second-largest administrative building and a symbol of Romania's communist past.",
      address: "Strada Izvor 2-4, București 050563, Romania",
      latitude: "44.4268",
      longitude: "26.0873",
      imageUrl: "/palace-of-parliament.jpg",
      category: "cultural",
    },
    {
      name: "Romanian Athenaeum",
      description: "An iconic concert hall and landmark of Romanian culture since 1888.",
      address: "Strada Benjamin Franklin 1-3, București 030167, Romania",
      latitude: "44.4414",
      longitude: "26.0970",
      imageUrl: "/romanian-athenaeum.jpg",
      category: "cultural",
    },
    {
      name: "National Museum of Art of Romania",
      description: "Romania's leading art museum, located in the former Royal Palace.",
      address: "Calea Victoriei 49-53, București 010063, Romania",
      latitude: "44.4397",
      longitude: "26.0963",
      imageUrl: "/national-museum-of-art.jpg",
      category: "cultural",
    },
    {
      name: "Caru' cu Bere",
      description: "Famous traditional Romanian restaurant and beer hall in the Old Town.",
      address: "Strada Stavropoleos 5, București 030081, Romania",
      latitude: "44.4305",
      longitude: "26.0976",
      imageUrl: "/caru-cu-bere.jpg",
      category: "food&drink",
    },
    {
      name: "Linea / Closer to the Moon",
      description: "Trendy rooftop bar and restaurant with city views.",
      address: "Strada Lipscani 17, București 030167, Romania",
      latitude: "44.4321",
      longitude: "26.1045",
      imageUrl: "/linea-closer-to-the-moon.jpg",
      category: "food&drink",
    },
    {
      name: "French Revolution",
      description: "Famous pastry shop known for its eclairs.",
      address: "Strada Constantin Esarcu 1, București 010302, Romania",
      latitude: "44.4410",
      longitude: "26.0960",
      imageUrl: "/french-revolution.jpg",
      category: "food&drink",
    },
    {
      name: "Herăstrău Park",
      description: "Bucharest's largest park surrounding Lake Herăstrău with beautiful gardens and outdoor activities.",
      address: "Șoseaua Nordului 7-9, București 014104, Romania",
      latitude: "44.4672",
      longitude: "26.0824",
      imageUrl: "/herastrau-park.jpg",
      category: "activities",
    },
    {
      name: "Cismigiu Gardens",
      description: "Historic public park with a lake, gardens, and boat rentals.",
      address: "Bulevardul Regina Elisabeta, București 030167, Romania",
      latitude: "44.4350",
      longitude: "26.0862",
      imageUrl: "/cismigiu-gardens.jpg",
      category: "activities",
    },
    {
      name: "Terra Park",
      description: "Amusement park with rides and attractions for all ages.",
      address: "Bulevardul Timișoara 8A, București 061344, Romania",
      latitude: "44.4320",
      longitude: "26.0170",
      imageUrl: "/terra-park.jpg",
      category: "activities",
    },
    {
      name: "Old Town (Lipscani)",
      description: "The historic center with cobblestone streets, restaurants, and vibrant nightlife.",
      address: "Strada Lipscani, București, Romania",
      latitude: "44.4323",
      longitude: "26.1063",
      imageUrl: "/old-town-lipscani.jpg",
      category: "nightlife",
    },
    {
      name: "Control Club",
      description: "Popular club for live music and nightlife in Bucharest.",
      address: "Strada Constantin Mille 4, București 010141, Romania",
      latitude: "44.4362",
      longitude: "26.1025",
      imageUrl: "/control-club.jpg",
      category: "nightlife",
    },
    {
      name: "Energiea Pub",
      description: "Trendy pub and bar with a lively atmosphere.",
      address: "Strada Ion Brezoianu 4, București 050023, Romania",
      latitude: "44.4355",
      longitude: "26.0967",
      imageUrl: "/energiea-pub.jpg",
      category: "nightlife",
    },
  ]

  // Geocode all locations
  for (const loc of locationData) {
    const geo = await geocodeAddress(loc.address);
    if (geo) {
      loc.latitude = geo.lat;
      loc.longitude = geo.lng;
      console.log(`Geocoded: ${loc.name} -> ${geo.lat}, ${geo.lng}`);
    } else {
      console.log(`Failed to geocode: ${loc.name}, using fallback coordinates.`);
    }
  }

  const insertedLocations = await db.insert(locations).values(locationData).returning()
  console.log(`Added ${insertedLocations.length} locations`)

  // Add events
  const eventData: Array<{
    title: string;
    description: string;
    startDatetime: Date;
    endDatetime: Date;
    locationId: string;
    mainCategory: "events" | "activities" | "food&drink" | "nightlife" | "culture";
    subCategory: "festival" | "concert" | "exhibition" | "standup" | "theater" | "film" | "dance" | "meetup" | "museum" | "monument" | "gallery" | "activity";
    imageUrl: string;
    price: string;
    capacity: number;
  }> = [
    {
      title: "Jazz in the Park",
      description: "Annual jazz festival featuring local and international artists in a beautiful park setting.",
      startDatetime: new Date("2024-05-15T19:00:00"),
      endDatetime: new Date("2024-05-15T23:00:00"),
      locationId: insertedLocations[6].id, // Control Club
      mainCategory: "events",
      subCategory: "festival",
      imageUrl: "/jazz-in-the-park.jpg",
      price: "0",
      capacity: 5000,
    },
    {
      title: "Bucharest Food Festival",
      description: "Taste the best of Romanian and international cuisine from local restaurants and food trucks.",
      startDatetime: new Date("2024-05-22T12:00:00"),
      endDatetime: new Date("2024-05-22T22:00:00"),
      locationId: insertedLocations[3].id, // Herăstrău Park
      mainCategory: "food&drink",
      subCategory: "festival",
      imageUrl: "/bucharest-food-festival.jpg",
      price: "0",
      capacity: 10000,
    },
    {
      title: "Classical Concert at Athenaeum",
      description: "Beautiful classical music performance by the Romanian Philharmonic Orchestra.",
      startDatetime: new Date("2024-05-20T19:30:00"),
      endDatetime: new Date("2024-05-20T21:30:00"),
      locationId: insertedLocations[1].id, // Romanian Athenaeum
      mainCategory: "events",
      subCategory: "concert",
      imageUrl: "/classical-concert-athenaeum.jpg",
      price: "35.00",
      capacity: 800,
    },
    {
      title: "Live DJ at Control Club",
      description: "Dance the night away with top DJs at Control Club.",
      startDatetime: new Date("2024-06-07T22:00:00"),
      endDatetime: new Date("2024-06-08T04:00:00"),
      locationId: insertedLocations[6].id, // Control Club
      mainCategory: "nightlife",
      subCategory: "concert",
      imageUrl: "/live-dj-control-club.jpg",
      price: "20.00",
      capacity: 300,
    },
    {
      title: "Romanian Design Week",
      description: "Showcase of contemporary Romanian design, architecture, and creative industries.",
      startDatetime: new Date("2024-05-17T10:00:00"),
      endDatetime: new Date("2024-05-25T20:00:00"),
      locationId: insertedLocations[0].id, // Palace of Parliament
      mainCategory: "culture",
      subCategory: "exhibition",
      imageUrl: "/romanian-design-week.jpg",
      price: "25.00",
      capacity: 200,
    },
    {
      title: "Art Expo at National Museum",
      description: "A special exhibition of modern Romanian art.",
      startDatetime: new Date("2024-06-10T10:00:00"),
      endDatetime: new Date("2024-06-10T18:00:00"),
      locationId: insertedLocations[2].id, // National Museum of Art
      mainCategory: "culture",
      subCategory: "exhibition",
      imageUrl: "/art-expo-national-museum.jpg",
      price: "15.00",
      capacity: 150,
    },
    {
      title: "Stand-up Comedy Night",
      description: "Hilarious evening with Romania's best stand-up comedians performing in English and Romanian.",
      startDatetime: new Date("2024-05-18T20:00:00"),
      endDatetime: new Date("2024-05-18T22:30:00"),
      locationId: insertedLocations[0].id, // Palace of Parliament
      mainCategory: "nightlife",
      subCategory: "standup",
      imageUrl: "/standup-comedy-night.jpg",
      price: "15.00",
      capacity: 150,
    },
    {
      title: "Comedy Open Mic",
      description: "Try your hand at stand-up or enjoy new local talent.",
      startDatetime: new Date("2024-06-15T19:00:00"),
      endDatetime: new Date("2024-06-15T21:00:00"),
      locationId: insertedLocations[8].id, // Energiea Pub
      mainCategory: "nightlife",
      subCategory: "standup",
      imageUrl: "/comedy-open-mic.jpg",
      price: "10.00",
      capacity: 80,
    },
    {
      title: "National Theater Play",
      description: "A classic Romanian play performed at the National Theater.",
      startDatetime: new Date("2024-06-05T19:00:00"),
      endDatetime: new Date("2024-06-05T21:00:00"),
      locationId: insertedLocations[0].id, // Palace of Parliament
      mainCategory: "culture",
      subCategory: "theater",
      imageUrl: "/national-theater-play.jpg",
      price: "18.00",
      capacity: 200,
    },
    {
      title: "Modern Drama Night",
      description: "Contemporary drama performed by young actors.",
      startDatetime: new Date("2024-06-12T20:00:00"),
      endDatetime: new Date("2024-06-12T22:00:00"),
      locationId: insertedLocations[1].id, // Romanian Athenaeum
      mainCategory: "culture",
      subCategory: "theater",
      imageUrl: "/modern-drama-night.jpg",
      price: "15.00",
      capacity: 120,
    },
    {
      title: "Bucharest Film Gala",
      description: "A celebration of Romanian and international cinema with screenings and awards.",
      startDatetime: new Date("2024-06-01T18:00:00"),
      endDatetime: new Date("2024-06-01T23:00:00"),
      locationId: insertedLocations[0].id, // Palace of Parliament
      mainCategory: "events",
      subCategory: "film",
      imageUrl: "/bucharest-film-gala.jpg",
      price: "20.00",
      capacity: 400,
    },
    {
      title: "Outdoor Movie Night",
      description: "Watch a classic film under the stars in Herăstrău Park.",
      startDatetime: new Date("2024-06-20T21:00:00"),
      endDatetime: new Date("2024-06-20T23:00:00"),
      locationId: insertedLocations[3].id, // Herăstrău Park
      mainCategory: "activities",
      subCategory: "film",
      imageUrl: "/outdoor-movie-night.jpg",
      price: "8.00",
      capacity: 100,
    },
    {
      title: "Salsa Night",
      description: "Join a lively salsa dance party in the city center.",
      startDatetime: new Date("2024-06-10T20:00:00"),
      endDatetime: new Date("2024-06-11T01:00:00"),
      locationId: insertedLocations[8].id, // Energiea Pub
      mainCategory: "nightlife",
      subCategory: "dance",
      imageUrl: "/salsa-night.jpg",
      price: "12.00",
      capacity: 120,
    },
    {
      title: "Folk Dance Festival",
      description: "Traditional Romanian folk dances performed by local groups.",
      startDatetime: new Date("2024-06-18T17:00:00"),
      endDatetime: new Date("2024-06-18T20:00:00"),
      locationId: insertedLocations[2].id, // National Museum of Art
      mainCategory: "culture",
      subCategory: "dance",
      imageUrl: "/folk-dance-festival.jpg",
      price: "10.00",
      capacity: 150,
    },
    {
      title: "Tech Meetup Bucharest",
      description: "Monthly meetup for tech enthusiasts and professionals.",
      startDatetime: new Date("2024-06-15T18:00:00"),
      endDatetime: new Date("2024-06-15T21:00:00"),
      locationId: insertedLocations[5].id, // Linea / Closer to the Moon
      mainCategory: "activities",
      subCategory: "meetup",
      imageUrl: "/tech-meetup-bucharest.jpg",
      price: "0",
      capacity: 80,
    },
    {
      title: "Writers' Meetup",
      description: "A gathering for local writers to share and discuss their work.",
      startDatetime: new Date("2024-06-22T17:00:00"),
      endDatetime: new Date("2024-06-22T19:00:00"),
      locationId: insertedLocations[2].id, // National Museum of Art
      mainCategory: "culture",
      subCategory: "meetup",
      imageUrl: "/writers-meetup.jpg",
      price: "0",
      capacity: 40,
    },
    {
      title: "Museum Night",
      description: "Explore Bucharest's museums after hours with special exhibits and activities.",
      startDatetime: new Date("2024-06-15T18:00:00"),
      endDatetime: new Date("2024-06-16T01:00:00"),
      locationId: insertedLocations[2].id, // National Museum of Art
      mainCategory: "culture",
      subCategory: "museum",
      imageUrl: "/museum-night.jpg",
      price: "10.00",
      capacity: 500,
    },
    {
      title: "Children's Museum Day",
      description: "Special activities and exhibits for kids at the museum.",
      startDatetime: new Date("2024-06-25T10:00:00"),
      endDatetime: new Date("2024-06-25T16:00:00"),
      locationId: insertedLocations[2].id, // National Museum of Art
      mainCategory: "culture",
      subCategory: "museum",
      imageUrl: "/childrens-museum-day.jpg",
      price: "5.00",
      capacity: 200,
    },
    {
      title: "Monument Tour",
      description: "Guided tour of Bucharest's most famous monuments.",
      startDatetime: new Date("2024-06-28T10:00:00"),
      endDatetime: new Date("2024-06-28T13:00:00"),
      locationId: insertedLocations[0].id, // Palace of Parliament
      mainCategory: "culture",
      subCategory: "monument",
      imageUrl: "/monument-tour.jpg",
      price: "10.00",
      capacity: 60,
    },
    {
      title: "Statue Walk",
      description: "Discover the stories behind Bucharest's statues and monuments.",
      startDatetime: new Date("2024-06-30T15:00:00"),
      endDatetime: new Date("2024-06-30T17:00:00"),
      locationId: insertedLocations[0].id, // Palace of Parliament
      mainCategory: "culture",
      subCategory: "monument",
      imageUrl: "/statue-walk.jpg",
      price: "8.00",
      capacity: 40,
    },
    {
      title: "Art Gallery Tour",
      description: "Guided tour of Bucharest's top art galleries and exhibitions.",
      startDatetime: new Date("2024-06-18T15:00:00"),
      endDatetime: new Date("2024-06-18T18:00:00"),
      locationId: insertedLocations[2].id, // National Museum of Art
      mainCategory: "culture",
      subCategory: "gallery",
      imageUrl: "/art-gallery-tour.jpg",
      price: "12.00",
      capacity: 80,
    },
    {
      title: "Photography Gallery Opening",
      description: "Opening night for a new photography gallery in the city.",
      startDatetime: new Date("2024-07-02T18:00:00"),
      endDatetime: new Date("2024-07-02T21:00:00"),
      locationId: insertedLocations[2].id, // National Museum of Art
      mainCategory: "culture",
      subCategory: "gallery",
      imageUrl: "/photography-gallery-opening.jpg",
      price: "10.00",
      capacity: 60,
    },
    {
      title: "Escape Room Challenge",
      description: "Test your wits and teamwork in Bucharest's top escape room experience.",
      startDatetime: new Date("2024-05-25T14:00:00"),
      endDatetime: new Date("2024-05-25T15:30:00"),
      locationId: insertedLocations[7].id, // Cismigiu Gardens
      mainCategory: "activities",
      subCategory: "activity",
      imageUrl: "/escape-room-challenge.jpg",
      price: "18.00",
      capacity: 60,
    },
    {
      title: "Outdoor Yoga in the Park",
      description: "Join a relaxing yoga session surrounded by nature in Herăstrău Park.",
      startDatetime: new Date("2024-05-28T09:00:00"),
      endDatetime: new Date("2024-05-28T10:30:00"),
      locationId: insertedLocations[3].id, // Herăstrău Park
      mainCategory: "activities",
      subCategory: "activity",
      imageUrl: "/outdoor-yoga-in-the-park.jpg",
      price: "10.00",
      capacity: 40,
    },
  ]

  let insertedEventsCount = 0
  for (const event of eventData) {
    const existing = await db.select().from(events).where(eq(events.title, event.title))
    if (existing.length === 0) {
      await db.insert(events).values(event)
      insertedEventsCount++
    } else {
      console.log(`Skipped duplicate event: ${event.title}`)
    }
  }
  console.log(`Added ${insertedEventsCount} unique events`)

  console.log("Database seeded successfully!")
}

seed().catch((error) => {
  console.error("Error seeding database:", error)
  process.exit(1)
})
