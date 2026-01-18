import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // clerkId
  email: text("email").notNull().unique(),
  name: text("name"),
  imageUrl: text("image_url"),
  city: text("city"), // 👈 ADD THIS
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  price: text("price"),
  isNegotiable: text("is_negotiable").default("false"),
  isSold: text("is_sold").default("false"),
  soldAt: timestamp("sold_at", { mode: "date" }),
  city: text("city").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
}, (table) => ({
  cityIdx: index("idx_products_city").on(table.city),
  userIdIdx: index("idx_products_user_id").on(table.userId),
  createdAtIdx: index("idx_products_created_at").on(table.createdAt),
}));


export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (table) => ({
  productIdIdx: index("idx_comments_product_id").on(table.productId),
  userIdIdx: index("idx_comments_user_id").on(table.userId),
}));

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  buyerId: text("buyer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sellerId: text("seller_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (table) => ({
  buyerIdIdx: index("idx_conversations_buyer_id").on(table.buyerId),
  sellerIdIdx: index("idx_conversations_seller_id").on(table.sellerId),
  productIdIdx: index("idx_conversations_product_id").on(table.productId),
}));

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isRead: text("is_read").notNull().default("false"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (table) => ({
  conversationIdIdx: index("idx_messages_conversation_id").on(table.conversationId),
  senderIdIdx: index("idx_messages_sender_id").on(table.senderId),
}));

//Relations define how tables connect to each other. This enables Drizzle's query API
//to automatically join related data when using `with: { relationName: true }`

//Users Relations: A user can have many products and many comments
//`many()` means one user can have multiple related records

export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  comments: many(comments),
  conversationsAsBuyer: many(conversations, { relationName: "buyer" }),
  conversationsAsSeller: many(conversations, { relationName: "seller" }),
  sentMessages: many(messages),
}));

// Products Relations: a product belongs to one user and can have many comments
// `one()` means a single related record, `many()` means multiple related records

export const productsRelations = relations(products, ({ one, many }) => ({
  comments: many(comments),
  // `fields` = the foreign key column in THIS table (products.userId)
  // `references` = the primary key column in the RELATED table (users.id)
  user: one(users, { fields: [products.userId], references: [users.id] }), // one product → one user
}));

// Comments Relations: A comment belongs to one user and one product
export const commentsRelations = relations(comments, ({ one }) => ({
  // `comments.userId` is the foreign key,  `users.id` is the primary key
  user: one(users, { fields: [comments.userId], references: [users.id] }), // One comment → one user
  // `comments.productId` is the foreign key,  `products.id` is the primary key
  product: one(products, { fields: [comments.productId], references: [products.id] }), // One comment → one product
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  product: one(products, { fields: [conversations.productId], references: [products.id] }),
  buyer: one(users, { fields: [conversations.buyerId], references: [users.id], relationName: "buyer" }),
  seller: one(users, { fields: [conversations.sellerId], references: [users.id], relationName: "seller" }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

// Type inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
