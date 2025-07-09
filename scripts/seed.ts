import { db } from "../src/db/drizzle"
import { events, locations } from "../src/db/schema"

async function seed() {
  console.log("Seeding database...")

  // Add locations first
  const locationData = [
    {
      name: "Palace of Parliament",
      description: "The world's second-largest administrative building and a symbol of Romania's communist past.",
      address: "Strada Izvor 2-4, București 050563, Romania",
      latitude: "44.4268",
      longitude: "26.0873",
      imageUrl: "/placeholder.svg?height=300&width=400",
    },
    {
      name: "Romanian Athenaeum",
      description: "An iconic concert hall and landmark of Romanian culture since 1888.",
      address: "Strada Benjamin Franklin 1-3, București 030167, Romania",
      latitude: "44.4414",
      longitude: "26.0970",
      imageUrl: "/placeholder.svg?height=300&width=400",
    },
    {
      name: "Old Town (Lipscani)",
      description: "The historic center with cobblestone streets, restaurants, and vibrant nightlife.",
      address: "Strada Lipscani, București, Romania",
      latitude: "44.4323",
      longitude: "26.1063",
      imageUrl: "/placeholder.svg?height=300&width=400",
    },
    {
      name: "Herăstrău Park",
      description: "Bucharest's largest park surrounding Lake Herăstrău with beautiful gardens and outdoor activities.",
      address: "Șoseaua Nordului 7-9, București 014104, Romania",
      latitude: "44.4672",
      longitude: "26.0824",
      imageUrl: "/placeholder.svg?height=300&width=400",
    },
  ]

  const insertedLocations = await db.insert(locations).values(locationData).returning()
  console.log(`Added ${insertedLocations.length} locations`)

  // Add events
  const eventData = [
    {
      title: "Jazz in the Park",
      description: "Annual jazz festival featuring local and international artists in a beautiful park setting.",
      startDatetime: new Date("2024-05-15T19:00:00"),
      endDatetime: new Date("2024-05-15T23:00:00"),
      locationId: insertedLocations[3].id, // Herăstrău Park
      category: "festival" as const,
      imageUrl: "/placeholder.svg?height=300&width=400",
      price: "0",
      capacity: 5000,
    },
    {
      title: "Romanian Design Week",
      description: "Showcase of contemporary Romanian design, architecture, and creative industries.",
      startDatetime: new Date("2024-05-17T10:00:00"),
      endDatetime: new Date("2024-05-25T20:00:00"),
      locationId: insertedLocations[0].id, // Palace of Parliament
      category: "exhibition" as const,
      imageUrl: "/placeholder.svg?height=300&width=400",
      price: "25.00",
      capacity: 200,
    },
    {
      title: "Stand-up Comedy Night",
      description: "Hilarious evening with Romania's best stand-up comedians performing in English and Romanian.",
      startDatetime: new Date("2024-05-18T20:00:00"),
      endDatetime: new Date("2024-05-18T22:30:00"),
      locationId: insertedLocations[2].id, // Old Town
      category: "standup" as const,
      imageUrl: "/placeholder.svg?height=300&width=400",
      price: "15.00",
      capacity: 150,
    },
    {
      title: "Classical Concert at Athenaeum",
      description: "Beautiful classical music performance by the Romanian Philharmonic Orchestra.",
      startDatetime: new Date("2024-05-20T19:30:00"),
      endDatetime: new Date("2024-05-20T21:30:00"),
      locationId: insertedLocations[1].id, // Romanian Athenaeum
      category: "concert" as const,
      imageUrl: "/placeholder.svg?height=300&width=400",
      price: "35.00",
      capacity: 800,
    },
    {
      title: "Bucharest Food Festival",
      description: "Taste the best of Romanian and international cuisine from local restaurants and food trucks.",
      startDatetime: new Date("2024-05-22T12:00:00"),
      endDatetime: new Date("2024-05-22T22:00:00"),
      locationId: insertedLocations[3].id, // Herăstrău Park
      category: "festival" as const,
      imageUrl: "/placeholder.svg?height=300&width=400",
      price: "0",
      capacity: 10000,
    },
  ]

  const insertedEvents = await db.insert(events).values(eventData).returning()
  console.log(`Added ${insertedEvents.length} events`)

  console.log("Database seeded successfully!")
}

seed().catch((error) => {
  console.error("Error seeding database:", error)
  process.exit(1)
})
