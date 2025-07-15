import { pgTable, uuid, text, timestamp, decimal, integer, date, boolean, pgEnum } from "drizzle-orm/pg-core"

// Enums
export const friendshipStatusEnum = pgEnum("friendship_status", ["pending", "accepted", "rejected"])

export const inviteStatusEnum = pgEnum("invite_status", ["pending", "accepted", "declined"])

export const roleEnum = pgEnum("role", ["owner", "editor", "viewer"])

export const targetTypeEnum = pgEnum("target_type", ["event", "location"])

export const mainCategoryEnum = pgEnum("main_category", [
  "events",
  "activities",
  "food&drink",
  "nightlife",
  "culture"
]);

export const subCategoryEnum = pgEnum("sub_category", [
  "festival",
  "concert",
  "exhibition",
  "standup",
  "theater",
  "film",
  "dance",
  "meetup",
  "museum",
  "monument",
  "gallery",
  "activity"
]);

export const locationCategoryEnum = pgEnum("location_category", [
  "cultural",
  "food&drink",
  "activities",
  "nightlife"
]);

// Tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").unique().notNull(),
  username: text("username").unique().notNull(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
})

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  imageUrl: text("image_url"),
  category: locationCategoryEnum("category").notNull(),
})

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull().unique(), // Ensure unique event titles
  description: text("description"),
  startDatetime: timestamp("start_datetime").notNull(),
  endDatetime: timestamp("end_datetime").notNull(),
  locationId: uuid("location_id")
    .references(() => locations.id)
    .notNull(),
  mainCategory: mainCategoryEnum("main_category").notNull(),
  subCategory: subCategoryEnum("sub_category").notNull(),
  imageUrl: text("image_url"),
  price: decimal("price", { precision: 10, scale: 2 }).default("0").notNull(),
  capacity: integer("capacity"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const itineraries = pgTable("itineraries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
})

export const itineraryItems = pgTable("itinerary_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  itineraryId: uuid("itinerary_id")
    .references(() => itineraries.id)
    .notNull(),
  date: date("date").notNull(),
  eventId: uuid("event_id").references(() => events.id),
  locationId: uuid("location_id").references(() => locations.id),
  orderInDay: integer("order_in_day").notNull(),
})

export const friendships = pgTable("friendships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  friendUserId: uuid("friend_user_id")
    .references(() => users.id)
    .notNull(),
  status: friendshipStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const eventInvites = pgTable("event_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id")
    .references(() => users.id)
    .notNull(),
  receiverId: uuid("receiver_id")
    .references(() => users.id)
    .notNull(),
  eventId: uuid("event_id")
    .references(() => events.id)
    .notNull(),
  status: inviteStatusEnum("status").default("pending").notNull(),
})

export const eventReservations = pgTable("event_reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  eventId: uuid("event_id")
    .references(() => events.id)
    .notNull(),
  quantity: integer("quantity").default(1).notNull(),
})

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  targetId: uuid("target_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const groupItineraries = pgTable("group_itineraries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: uuid("owner_id")
    .references(() => users.id)
    .notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
})

export const groupItineraryMembers = pgTable("group_itinerary_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupItineraryId: uuid("group_itinerary_id")
    .references(() => groupItineraries.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  role: roleEnum("role").notNull(),
})

export const groupItineraryItems = pgTable("group_itinerary_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupItineraryId: uuid("group_itinerary_id")
    .references(() => groupItineraries.id)
    .notNull(),
  targetType: targetTypeEnum("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  day: date("day").notNull(),
  orderInDay: integer("order_in_day").notNull(),
  addedByUserId: uuid("added_by_user_id")
    .references(() => users.id)
    .notNull(),
})

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  question: text("question").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const wishlist = pgTable("wishlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  targetType: text("target_type").notNull(), // "event" or "location"
  targetId: uuid("target_id").notNull(),     // references events.id or locations.id
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
