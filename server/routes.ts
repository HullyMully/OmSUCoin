import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { 
  insertActivitySchema, 
  insertRegistrationSchema, 
  insertTransactionSchema, 
  insertRewardSchema 
} from "@shared/schema";
import Web3 from "web3";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';

// Get current file directory (ES modules version of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Web3 with BSC Testnet
const web3 = new Web3(process.env.BSC_PROVIDER_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/");

// Load contract ABI
const contractABI = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../contracts/OmSUCoin.abi.json"), "utf8")
);

// Initialize contract
const contractAddress = process.env.OMSUCOIN_CONTRACT_ADDRESS || "";
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Admin private key for token minting
const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY || "";
if (adminPrivateKey) {
  web3.eth.accounts.wallet.add(adminPrivateKey);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Users endpoints
  app.get("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only allow admins to view other users' data
      if (req.user?.id !== userId && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only allow users to update their own data or admins to update any user
      if (req.user?.id !== userId && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Prevent updating role unless user is admin
      if (req.body.role && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Cannot update role" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Failed to update user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Activities endpoints
  app.get("/api/activities", isAuthenticated, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const activities = await storage.listActivities(status, offset, limit);
      res.json(activities);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get("/api/activities/:id", isAuthenticated, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const activity = await storage.getActivity(activityId);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.json(activity);
    } catch (error) {
      console.error("Failed to fetch activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  app.post("/api/activities", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const newActivity = await storage.createActivity(activityData);
      res.status(201).json(newActivity);
    } catch (error) {
      console.error("Failed to create activity:", error);
      res.status(400).json({ message: "Failed to create activity", error });
    }
  });

  app.patch("/api/activities/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const updatedActivity = await storage.updateActivity(activityId, req.body);
      
      if (!updatedActivity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.json(updatedActivity);
    } catch (error) {
      console.error("Failed to update activity:", error);
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  // Registrations endpoints
  app.get("/api/activities/:id/registrations", isAuthenticated, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      
      // If admin, return detailed participant info, otherwise just basic info
      if (req.user?.role === "admin") {
        const registrations = await storage.getRegistrationWithUserDetails(activityId);
        return res.json(registrations);
      }
      
      const registrations = await storage.listRegistrationsByActivity(activityId);
      res.json(registrations);
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.post("/api/activities/:id/register", isAuthenticated, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if activity exists
      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Check if activity is open for registration
      if (activity.status !== "open") {
        return res.status(400).json({ message: "Activity is not open for registration" });
      }
      
      // Check if user is already registered
      const existingRegistration = await storage.getRegistration(userId, activityId);
      if (existingRegistration) {
        return res.status(400).json({ message: "Already registered for this activity" });
      }
      
      // Create registration
      const registrationData = insertRegistrationSchema.parse({
        userId,
        activityId,
        status: "registered"
      });
      
      const newRegistration = await storage.createRegistration(registrationData);
      res.status(201).json(newRegistration);
    } catch (error) {
      console.error("Failed to register for activity:", error);
      res.status(400).json({ message: "Failed to register for activity", error });
    }
  });

  app.patch("/api/registrations/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const registrationId = parseInt(req.params.id);
      const updatedRegistration = await storage.updateRegistration(registrationId, req.body);
      
      if (!updatedRegistration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      res.json(updatedRegistration);
    } catch (error) {
      console.error("Failed to update registration:", error);
      res.status(500).json({ message: "Failed to update registration" });
    }
  });

  // User registrations
  app.get("/api/my/registrations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const registrations = await storage.listRegistrationsByUser(userId);
      res.json(registrations);
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // Transactions endpoints
  app.get("/api/my/transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transactions = await storage.listTransactionsByUser(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Mint tokens for activity participants
  app.post("/api/activities/:id/mint", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const { userIds, note } = req.body;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "User IDs are required" });
      }
      
      // Get activity
      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Get users with wallet addresses
      const usersData = [];
      const addresses = [];
      const amounts = [];
      
      for (const userId of userIds) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: `User ${userId} not found` });
        }
        
        if (!user.walletAddress) {
          return res.status(400).json({ message: `User ${userId} has no wallet address` });
        }
        
        usersData.push(user);
        addresses.push(user.walletAddress);
        amounts.push(web3.utils.toWei(activity.tokens.toString(), "ether"));
      }
      
      if (addresses.length === 0) {
        return res.status(400).json({ message: "No valid users to mint tokens for" });
      }
      
      // Prepare to mint tokens
      const adminAccount = web3.eth.accounts.wallet[0].address;
      
      // Batch mint tokens
      const gasPrice = await web3.eth.getGasPrice();
      const batchMintTx = contract.methods.batchMint(addresses, amounts);
      
      const gas = await batchMintTx.estimateGas({ from: adminAccount });
      const txData = {
        from: adminAccount,
        gas: gas.toString(),
        gasPrice: gasPrice.toString()
      };
      
      // Send transaction
      const receipt = await batchMintTx.send(txData);
      
      // Record transactions in database
      const transactions = [];
      for (const user of usersData) {
        // Update user token balance
        await storage.updateUser(user.id, {
          tokenBalance: user.tokenBalance + activity.tokens
        });
        
        // Create transaction record
        const transactionData = insertTransactionSchema.parse({
          userId: user.id,
          activityId,
          amount: activity.tokens,
          type: "activity_reward",
          txHash: receipt.transactionHash,
          description: note || `Tokens for ${activity.title}`
        });
        
        const transaction = await storage.createTransaction(transactionData);
        transactions.push(transaction);
      }
      
      res.status(201).json({
        txHash: receipt.transactionHash,
        transactions
      });
    } catch (error) {
      console.error("Failed to mint tokens:", error);
      res.status(500).json({ message: "Failed to mint tokens", error });
    }
  });

  // Leaderboard endpoint
  app.get("/api/leaderboard", isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const leaderboard = await storage.getLeaderboard(limit);
      
      // Only return necessary fields for privacy
      const sanitizedLeaderboard = leaderboard.map(user => ({
        id: user.id,
        pseudonym: user.pseudonym || `Student${user.id}`,
        faculty: user.faculty,
        tokenBalance: user.tokenBalance,
        createdAt: user.createdAt
      }));
      
      res.json(sanitizedLeaderboard);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Rewards endpoints
  app.get("/api/rewards", isAuthenticated, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const rewards = await storage.listRewards(status);
      res.json(rewards);
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  app.post("/api/rewards", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const rewardData = insertRewardSchema.parse(req.body);
      const newReward = await storage.createReward(rewardData);
      res.status(201).json(newReward);
    } catch (error) {
      console.error("Failed to create reward:", error);
      res.status(400).json({ message: "Failed to create reward", error });
    }
  });

  app.patch("/api/rewards/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      const updatedReward = await storage.updateReward(rewardId, req.body);
      
      if (!updatedReward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      res.json(updatedReward);
    } catch (error) {
      console.error("Failed to update reward:", error);
      res.status(500).json({ message: "Failed to update reward" });
    }
  });

  // Purchase reward
  app.post("/api/rewards/:id/purchase", isAuthenticated, async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Get reward
      const reward = await storage.getReward(rewardId);
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      // Check if reward is available
      if (reward.status !== "available") {
        return res.status(400).json({ message: "Reward is not available" });
      }
      
      // Check if quantity is available
      if (reward.quantity !== null && reward.quantity <= 0) {
        return res.status(400).json({ message: "Reward is out of stock" });
      }
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has enough tokens
      if (user.tokenBalance < reward.tokenCost) {
        return res.status(400).json({ message: "Insufficient token balance" });
      }
      
      // Update user token balance
      await storage.updateUser(userId, {
        tokenBalance: user.tokenBalance - reward.tokenCost
      });
      
      // Update reward quantity if needed
      if (reward.quantity !== null) {
        await storage.updateReward(rewardId, {
          quantity: reward.quantity - 1
        });
      }
      
      // Create transaction record
      const transactionData = insertTransactionSchema.parse({
        userId,
        rewardId,
        amount: -reward.tokenCost,
        type: "reward_purchase",
        description: `Purchase: ${reward.title}`
      });
      
      const transaction = await storage.createTransaction(transactionData);
      
      res.status(201).json({
        success: true,
        transaction,
        newBalance: user.tokenBalance - reward.tokenCost
      });
    } catch (error) {
      console.error("Failed to purchase reward:", error);
      res.status(500).json({ message: "Failed to purchase reward", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
