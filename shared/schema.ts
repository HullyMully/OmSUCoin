import { pgTable, text, serial, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User role enum
export const userRoleEnum = pgEnum('user_role', ['student', 'admin']);

// User status enum
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive']);

// Activity status enum
export const activityStatusEnum = pgEnum('activity_status', ['open', 'closed', 'completed']);

// Registration status enum
export const registrationStatusEnum = pgEnum('registration_status', ['registered', 'confirmed', 'rejected']);

// Transaction type enum
export const transactionTypeEnum = pgEnum('transaction_type', ['activity_reward', 'reward_purchase']);

// Reward status enum
export const rewardStatusEnum = pgEnum('reward_status', ['available', 'unavailable']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  surname: text("surname").notNull(),
  studentId: text("student_id").notNull().unique(),
  email: text("email").notNull().unique(),
  pseudonym: text("pseudonym"),
  faculty: text("faculty"),
  walletAddress: text("wallet_address"),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('student'),
  status: userStatusEnum("status").notNull().default('active'),
  tokenBalance: integer("token_balance").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tokens: integer("tokens").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  status: activityStatusEnum("status").notNull().default('open'),
  maxParticipants: integer("max_participants"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").notNull(),
});

// Registrations table
export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityId: integer("activity_id").notNull(),
  status: registrationStatusEnum("status").notNull().default('registered'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityId: integer("activity_id"),
  rewardId: integer("reward_id"),
  amount: integer("amount").notNull(),
  type: transactionTypeEnum("type").notNull(),
  txHash: text("tx_hash"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Rewards table
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tokenCost: integer("token_cost").notNull(),
  quantity: integer("quantity"),
  status: rewardStatusEnum("status").notNull().default('available'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  tokenBalance: true,
  createdAt: true
});

export const insertActivitySchema = createInsertSchema(activities).omit({ 
  id: true,
  createdAt: true
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true,
  createdAt: true
});

export const insertRewardSchema = createInsertSchema(rewards).omit({ 
  id: true,
  createdAt: true
});

// Extended schemas for specific validations
export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
