import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import Razorpay from "razorpay";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://jainutsav00:root@cluster0.7fuwn.mongodb.net/?appName=Cluster0";
const JWT_SECRET = process.env.JWT_SECRET || "plantguard_secret_key_123";

const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  credits: { type: Number, default: 3 },
  createdAt: { type: Date, default: Date.now }
});

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String, required: true }, // Base64 or URL
  result: {
    disease: String,
    status: String,
    cause: String,
    precautions: String,
    treatment: String,
    longTermCare: String,
    confidence: String
  },
  date: { type: Date, default: Date.now }
});

const supportRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const History = mongoose.model('History', historySchema);
const SupportRequest = mongoose.model('SupportRequest', supportRequestSchema);

// Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admins only." });
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const role = email === 'jainutsav570@gmail.com' ? 'admin' : 'user';
      const user = new User({ email, password: hashedPassword, name, role });
      await user.save();

      const token = jwt.sign({ id: user._id, email: user.email, name: user.name, role: user.role }, JWT_SECRET);
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ message: "Registered successfully", user: { id: user._id, email: user.email, name: user.name, role: user.role, credits: user.credits } });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: "User not found" });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: "Invalid password" });

      const token = jwt.sign({ id: user._id, email: user.email, name: user.name, role: user.role }, JWT_SECRET);
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ message: "Logged in successfully", user: { id: user._id, email: user.email, name: user.name, role: user.role, credits: user.credits } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.id, '-password');
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role, credits: user.credits } });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Admin Routes
  app.get("/api/admin/stats", authenticateToken, isAdmin, async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalDiagnostics = await History.countDocuments();
      
      // Disease distribution
      const diseaseStats = await History.aggregate([
        { $group: { _id: "$result.disease", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      // Diagnostics over last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const dailyDiagnostics = await History.aggregate([
        { $match: { date: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // User growth over last 7 days
      const dailyUserGrowth = await User.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json({
        totalUsers,
        totalDiagnostics,
        diseaseStats,
        dailyDiagnostics,
        dailyUserGrowth
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
    try {
      const users = await User.find({}, '-password').sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      await History.deleteMany({ userId: req.params.id });
      res.json({ message: "User and their history deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.patch("/api/admin/users/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { role, credits } = req.body;
      const updateData: any = {};
      if (role) updateData.role = role;
      if (credits !== undefined) updateData.credits = credits;
      
      await User.findByIdAndUpdate(req.params.id, updateData);
      res.json({ message: "User updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.get("/api/admin/support", authenticateToken, isAdmin, async (req, res) => {
    try {
      const requests = await SupportRequest.find().sort({ createdAt: -1 });
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch support requests" });
    }
  });

  app.patch("/api/admin/support/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      await SupportRequest.findByIdAndUpdate(req.params.id, { status });
      res.json({ message: "Support request updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update support request" });
    }
  });

  app.post("/api/support", async (req, res) => {
    try {
      const { name, email, subject, message, userId } = req.body;
      const request = new SupportRequest({ name, email, subject, message, userId });
      await request.save();
      res.json({ message: "Support request submitted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit support request" });
    }
  });

  app.post("/api/credits/buy", authenticateToken, async (req: any, res) => {
    try {
      if (!razorpay) {
        return res.status(500).json({ 
          error: "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the Secrets panel." 
        });
      }
      const { amount, credits } = req.body;
      const options = {
        amount: amount * 100, // amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };
      const order = await razorpay.orders.create(options);
      res.json({ order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (error: any) {
      console.error("Razorpay order creation failed:", error);
      const errorMessage = error.error?.description || "Failed to create payment order";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/credits/verify", authenticateToken, async (req: any, res) => {
    try {
      if (!razorpay) {
        return res.status(500).json({ error: "Razorpay is not configured." });
      }
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, credits } = req.body;
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        
        user.credits += credits;
        await user.save();
        res.json({ message: "Payment verified and credits added", credits: user.credits });
      } else {
        res.status(400).json({ error: "Invalid payment signature" });
      }
    } catch (error) {
      res.status(500).json({ error: "Payment verification failed" });
    }
  });

  // History Routes
  app.get("/api/history", authenticateToken, async (req: any, res) => {
    try {
      const history = await History.find({ userId: req.user.id }).sort({ date: -1 }).limit(20);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.post("/api/history", authenticateToken, async (req: any, res) => {
    try {
      const { image, result } = req.body;
      const user = await User.findById(req.user.id);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      if (user.credits <= 0 && user.role !== 'admin') {
        return res.status(403).json({ error: "No credits remaining. Please buy more credits." });
      }

      const historyItem = new History({
        userId: req.user.id,
        image,
        result
      });
      await historyItem.save();

      if (user.role !== 'admin') {
        user.credits -= 1;
        await user.save();
      }

      res.json({ historyItem, credits: user.credits });
    } catch (error) {
      res.status(500).json({ error: "Failed to save history" });
    }
  });

  app.delete("/api/history/:id", authenticateToken, async (req: any, res) => {
    try {
      await History.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete history" });
    }
  });

  app.get("/api/user/stats", authenticateToken, async (req: any, res) => {
    try {
      const totalDiagnostics = await History.countDocuments({ userId: req.user.id });
      
      // Disease distribution for this user
      const diseaseStats = await History.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
        { $group: { _id: "$result.disease", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      // Diagnostics over last 7 days for this user
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const dailyDiagnostics = await History.aggregate([
        { 
          $match: { 
            userId: new mongoose.Types.ObjectId(req.user.id),
            date: { $gte: sevenDaysAgo } 
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json({
        totalDiagnostics,
        diseaseStats,
        dailyDiagnostics
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
