import { users, activities, registrations, transactions, rewards } from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, count } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import type { 
  User, 
  InsertUser, 
  Activity, 
  InsertActivity, 
  Registration, 
  InsertRegistration, 
  Transaction, 
  InsertTransaction, 
  Reward, 
  InsertReward 
} from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStudentId(studentId: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  listUsers(offset?: number, limit?: number): Promise<User[]>;
  getLeaderboard(limit?: number): Promise<User[]>;
  
  // Activities
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined>;
  listActivities(status?: string, offset?: number, limit?: number): Promise<Activity[]>;

  // Registrations
  getRegistration(userId: number, activityId: number): Promise<Registration | undefined>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistration(id: number, updates: Partial<Registration>): Promise<Registration | undefined>;
  listRegistrationsByUser(userId: number): Promise<Registration[]>;
  listRegistrationsByActivity(activityId: number): Promise<Registration[]>;
  getRegistrationWithUserDetails(activityId: number): Promise<any[]>;

  // Transactions
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  listTransactionsByUser(userId: number, limit?: number): Promise<Transaction[]>;

  // Rewards
  getReward(id: number): Promise<Reward | undefined>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: number, updates: Partial<Reward>): Promise<Reward | undefined>;
  listRewards(status?: string): Promise<Reward[]>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByStudentId(studentId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.studentId, studentId));
    return user;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async listUsers(offset = 0, limit = 50): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset);
  }

  async getLeaderboard(limit = 20): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, 'student'))
      .orderBy(desc(users.tokenBalance))
      .limit(limit);
  }

  // Activities
  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));
    return activity;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined> {
    const [updatedActivity] = await db
      .update(activities)
      .set(updates)
      .where(eq(activities.id, id))
      .returning();
    return updatedActivity;
  }

  async listActivities(status?: string, offset = 0, limit = 50): Promise<Activity[]> {
    if (status && status !== 'all') {
      return await db
        .select()
        .from(activities)
        .where(eq(activities.status, status as any))
        .orderBy(desc(activities.date))
        .limit(limit)
        .offset(offset);
    }

    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.date))
      .limit(limit)
      .offset(offset);
  }

  // Registrations
  async getRegistration(userId: number, activityId: number): Promise<Registration | undefined> {
    const [registration] = await db
      .select()
      .from(registrations)
      .where(
        and(
          eq(registrations.userId, userId),
          eq(registrations.activityId, activityId)
        )
      );
    return registration;
  }

  async createRegistration(registration: InsertRegistration): Promise<Registration> {
    const [newRegistration] = await db
      .insert(registrations)
      .values(registration)
      .returning();
    return newRegistration;
  }

  async updateRegistration(id: number, updates: Partial<Registration>): Promise<Registration | undefined> {
    const [updatedRegistration] = await db
      .update(registrations)
      .set(updates)
      .where(eq(registrations.id, id))
      .returning();
    return updatedRegistration;
  }

  async listRegistrationsByUser(userId: number): Promise<Registration[]> {
    return await db
      .select()
      .from(registrations)
      .where(eq(registrations.userId, userId));
  }

  async listRegistrationsByActivity(activityId: number): Promise<Registration[]> {
    return await db
      .select()
      .from(registrations)
      .where(eq(registrations.activityId, activityId));
  }

  async getRegistrationWithUserDetails(activityId: number): Promise<any[]> {
    const result = await db
      .select({
        registrationId: registrations.id,
        registrationStatus: registrations.status,
        userId: users.id,
        name: users.name,
        surname: users.surname,
        studentId: users.studentId,
        pseudonym: users.pseudonym,
        email: users.email,
        faculty: users.faculty,
        walletAddress: users.walletAddress
      })
      .from(registrations)
      .innerJoin(users, eq(registrations.userId, users.id))
      .where(eq(registrations.activityId, activityId))
      .orderBy(registrations.createdAt);
    
    return result;
  }

  // Transactions
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async listTransactionsByUser(userId: number, limit = 20): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  // Rewards
  async getReward(id: number): Promise<Reward | undefined> {
    const [reward] = await db
      .select()
      .from(rewards)
      .where(eq(rewards.id, id));
    return reward;
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const [newReward] = await db
      .insert(rewards)
      .values(reward)
      .returning();
    return newReward;
  }

  async updateReward(id: number, updates: Partial<Reward>): Promise<Reward | undefined> {
    const [updatedReward] = await db
      .update(rewards)
      .set(updates)
      .where(eq(rewards.id, id))
      .returning();
    return updatedReward;
  }

  async listRewards(status?: string): Promise<Reward[]> {
    if (status && status !== 'all') {
      return await db
        .select()
        .from(rewards)
        .where(eq(rewards.status, status as any));
    }
    return await db.select().from(rewards);
  }
}

export const storage = new DatabaseStorage();
