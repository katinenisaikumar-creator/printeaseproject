const express = require("express");
const cors = require("cors");
const pool = require("./db");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();
const Razorpay = require("razorpay");

// 1. CORS Configuration
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
    credentials: false,
  })
);

app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Temporary in-memory store for OTPs
const otpStore = {};

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Root Route
app.get("/", (req, res) => {
  res.json({ message: "PrintEase Backend is running!" });
});

// -----------------------------------------------------------------------------
// Database Auto-Initialization
// -----------------------------------------------------------------------------

// Auto-create users table
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    collegeid VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catch((err) => console.error("Error creating users table:", err));

// Auto-create admin_users table
pool.query(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Super Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catch((err) => console.error("Error creating admin_users table:", err));

// Auto-create printers table
pool.query(`
  CREATE TABLE IF NOT EXISTS printers (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Online',
    paper_level INT DEFAULT 100,
    queue_count INT DEFAULT 0,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catch((err) => console.error("Error creating printers table:", err));

// -----------------------------------------------------------------------------
// OTP Endpoints
// -----------------------------------------------------------------------------

app.post("/send-otp", (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = {
      otp: generatedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    console.log(`[OTP DEBUG] Mobile: ${phone} | Generated OTP: ${generatedOtp}`);
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

app.post("/verify-otp", (req, res) => {
  try {
    const { phone, otp } = req.body;
    const storedData = otpStore[phone];

    if (!storedData) {
      return res.status(400).json({ message: "OTP not requested or expired" });
    }

    if (Date.now() > storedData.expiresAt) {
      delete otpStore[phone];
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP entered" });
    }

    delete otpStore[phone];
    res.json({ message: "OTP verified successfully", success: true });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

// -----------------------------------------------------------------------------
// User Registration & Auth
// -----------------------------------------------------------------------------

app.post("/set-password", async (req, res) => {
  try {
    console.log("Set Password Request Body:", req.body); // Log request body
    const { phone, password, name, collegeid, department } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone number and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    const existingUser = await pool.query("SELECT id FROM users WHERE phone = $1", [cleanPhone]);
    const passwordHash = await bcrypt.hash(password, 10);

    if (existingUser.rows.length > 0) {
      await pool.query("UPDATE users SET password_hash = $1 WHERE phone = $2", [passwordHash, cleanPhone]);
      return res.status(200).json({ message: "Password updated successfully", success: true });
    } else {
      // Validate registration fields for new user
      if (!name || !collegeid || !department) {
        return res.status(400).json({ 
          message: "Name, College ID, and Department are required for new registration" 
        });
      }

      const result = await pool.query(
        `INSERT INTO users (name, collegeid, department, phone, password_hash)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, collegeid, department, phone, created_at`,
        [name, collegeid, department, cleanPhone, passwordHash]
      );

      return res.status(200).json({ message: "User registered successfully", user: result.rows[0], success: true });
    }
  } catch (error) {
    console.error("Set Password Internal Error:", error); // Logs detailed SQL error to Node console
    res.status(500).json({ message: error.message || "Failed to set password / create user" });
  }
});
app.post("/reset-password", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone number and new password are required" });
    }

    // Extract only the digits (e.g., "+91 7013591805" -> "7013591805")
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    // Search using exact match OR trailing 10 digits match
    const userCheck = await pool.query(
      "SELECT id FROM users WHERE phone = $1 OR phone LIKE $2",
      [cleanPhone, `%${cleanPhone}`]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "No account found with this phone number" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      passwordHash,
      userCheck.rows[0].id,
    ]);

    res.status(200).json({ message: "Password reset successful!", success: true });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone number and password are required" });
    }

    const result = await pool.query(
      "SELECT id, name, collegeid, department, phone, password_hash FROM users WHERE phone = $1",
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid mobile number or password" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid mobile number or password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        collegeid: user.collegeid,
        department: user.department,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, collegeid, department, phone, COALESCE(status, 'Active') AS status, created_at FROM users ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, name, collegeid, department, phone, COALESCE(status, 'Active') AS status FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Update user status (Active / Disabled)
app.put("/users/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      "UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, status",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User status updated", user: result.rows[0] });
  } catch (error) {
    console.error("Update User Status Error:", error);
    res.status(500).json({ message: "Failed to update user status" });
  }
});

// Reset user password
app.post("/users/:id/reset-password", async (req, res) => {
  try {
    const { id } = req.params;
    const defaultHash = await bcrypt.hash("123456", 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [defaultHash, id]);
    res.json({ message: "Password reset successfully to default: 123456" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// -----------------------------------------------------------------------------
// Database & Utility
// -----------------------------------------------------------------------------

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Database connected successfully!", time: result.rows[0].now });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// -----------------------------------------------------------------------------
// Admin Dashboard
// -----------------------------------------------------------------------------

app.get("/dashboard", async (req, res) => {
  try {
    const revenue = await pool.query(`
      SELECT COALESCE(SUM(total_amount),0) AS today_revenue
      FROM print_jobs WHERE DATE(created_at) = CURRENT_DATE
    `);

    const jobs = await pool.query(`
      SELECT COUNT(*) AS today_jobs
      FROM print_jobs WHERE DATE(created_at) = CURRENT_DATE
    `);

    const success = await pool.query(`
      SELECT ROUND(
        (COUNT(*) FILTER (WHERE print_status = 'completed')::decimal / NULLIF(COUNT(*), 0)) * 100, 2
      ) AS success_rate FROM print_jobs
    `);

    const chart = await pool.query(`
      SELECT TO_CHAR(created_at,'Dy') AS day, COALESCE(SUM(total_amount),0) AS revenue
      FROM print_jobs
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY day, DATE(created_at)
      ORDER BY DATE(created_at)
    `);

    const recentJobs = await pool.query(`
      SELECT 
        users.name AS student,
        print_jobs.file_name AS file,
        print_jobs.page_count AS pages,
        print_jobs.total_amount AS amount,
        print_jobs.print_status AS status,
        TO_CHAR(print_jobs.created_at,'HH24:MI') AS time
      FROM print_jobs
      LEFT JOIN users ON users.id = print_jobs.user_id
      ORDER BY print_jobs.created_at DESC LIMIT 5
    `);

    res.json({
      todayRevenue: Number(revenue.rows[0].today_revenue),
      todayJobs: Number(jobs.rows[0].today_jobs),
      successRate: Number(success.rows[0].success_rate || 0),
      activePrinters: 1,
      revenueLast7Days: chart.rows,
      recentJobs: recentJobs.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
});

app.get("/pricing", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pricing ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pricing" });
  }
});

app.put("/pricing/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { price_per_page } = req.body;
    const result = await pool.query(
      "UPDATE pricing SET price_per_page = $1 WHERE id = $2 RETURNING *",
      [price_per_page, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pricing not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Pricing update failed" });
  }
});

app.post("/verify-pin", async (req, res) => {
  try {
    const { pin } = req.body;
    const result = await pool.query(
      "SELECT id, pin, file_name, page_count, copies, total_amount, print_status FROM print_jobs WHERE pin = $1",
      [pin]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Invalid PIN" });
    }

    const job = result.rows[0];
    if (job.print_status === "completed") {
      return res.status(400).json({ success: false, message: "This PIN has already been used" });
    }

    res.json({ success: true, print_job: job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "PIN verification failed" });
  }
});

app.post("/upload-pdf", upload.single("pdf"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }
    res.json({
      message: "PDF uploaded successfully",
      file_name: req.file.originalname,
      file_url: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "PDF upload failed" });
  }
});

// -----------------------------------------------------------------------------
// Print Jobs & Stats
// -----------------------------------------------------------------------------

app.post("/print-jobs", async (req, res) => {
  try {
    const { user_id, file_name, file_url, page_count, color_mode, print_side, paper_size, copies } = req.body;

    const pricingResult = await pool.query(
      `SELECT price_per_page FROM pricing
       WHERE UPPER(paper_size) = UPPER($1)
       AND UPPER(color_mode) = UPPER($2)
       AND UPPER(print_side) = UPPER($3)
       LIMIT 1`,
      [paper_size, color_mode, print_side]
    );

    if (pricingResult.rows.length === 0) {
      return res.status(400).json({ message: "Pricing not found for selected options" });
    }

    const pricePerPage = Number(pricingResult.rows[0].price_per_page);
    const totalAmount = pricePerPage * Number(page_count) * Number(copies);
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const result = await pool.query(
      `INSERT INTO print_jobs
      (user_id, file_name, file_url, page_count, color_mode, print_side, paper_size, copies, total_amount, payment_status, pin, print_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [user_id, file_name, file_url, page_count, color_mode, print_side, paper_size, copies, totalAmount, "pending", pin, "waiting"]
    );

    res.status(201).json({ message: "Print job created successfully", print_job: result.rows[0] });
  } catch (error) {
    console.error("Create Print Job Error:", error);
    res.status(500).json({ message: "Failed to create print job" });
  }
});

app.get("/print-jobs/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query("SELECT * FROM print_jobs WHERE user_id = $1 ORDER BY id DESC", [user_id]);
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch Print Jobs Error:", error);
    res.status(500).json({ message: "Failed to fetch print jobs" });
  }
});

app.get("/user-stats/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      `SELECT COUNT(*) AS total_orders, COALESCE(SUM(copies * page_count), 0) AS total_prints, COALESCE(SUM(total_amount), 0) AS total_spent
       FROM print_jobs WHERE user_id = $1`,
      [user_id]
    );

    res.status(200).json({
      total_orders: Number(result.rows[0].total_orders),
      total_prints: Number(result.rows[0].total_prints),
      total_spent: Number(result.rows[0].total_spent),
    });
  } catch (error) {
    console.error("User Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch user statistics" });
  }
});

app.put("/print-jobs/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { print_status } = req.body;
    const allowedStatuses = ["waiting", "printing", "completed", "cancelled"];
    if (!allowedStatuses.includes(print_status)) {
      return res.status(400).json({ message: "Invalid print status" });
    }

    const result = await pool.query("UPDATE print_jobs SET print_status = $1 WHERE id = $2 RETURNING *", [print_status, id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Print job not found" });

    res.json({ message: "Print status updated successfully", print_job: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update print status" });
  }
});

app.put("/print-jobs/:id/payment", async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    const allowedStatuses = ["pending", "paid", "failed"];
    if (!allowedStatuses.includes(payment_status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const result = await pool.query("UPDATE print_jobs SET payment_status = $1 WHERE id = $2 RETURNING *", [payment_status, id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Print job not found" });

    res.json({ message: "Payment status updated successfully", print_job: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update payment status" });
  }
});

// -----------------------------------------------------------------------------
// Razorpay Integration
// -----------------------------------------------------------------------------

const razorpay = new Razorpay({
  key_id: "rzp_test_TPJViABRIyiIFp",
  key_secret: "7Ln9tUssVfKpNaYkOIYcl3B5",
});

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const options = { amount: amount * 100, currency: "INR", receipt: "receipt_" + Date.now() };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
});

// -----------------------------------------------------------------------------
// Transactions Endpoint
// -----------------------------------------------------------------------------

app.get("/transactions", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        print_jobs.id,
        users.name AS student,
        print_jobs.file_name AS file,
        print_jobs.page_count AS pages,
        print_jobs.copies,
        print_jobs.total_amount AS amount,
        print_jobs.payment_status AS "paymentStatus",
        print_jobs.print_status AS "printStatus",
        print_jobs.created_at
      FROM print_jobs
      LEFT JOIN users ON users.id = print_jobs.user_id
      ORDER BY print_jobs.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch Transactions Error:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// -----------------------------------------------------------------------------
// Reports Endpoint
// -----------------------------------------------------------------------------

app.get("/reports", async (req, res) => {
  try {
    const dailyRev = await pool.query(`SELECT COALESCE(SUM(total_amount), 0) AS daily FROM print_jobs WHERE DATE(created_at) = CURRENT_DATE`);
    const weeklyRev = await pool.query(`SELECT COALESCE(SUM(total_amount), 0) AS weekly FROM print_jobs WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'`);
    const monthlyRev = await pool.query(`SELECT COALESCE(SUM(total_amount), 0) AS monthly FROM print_jobs WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)`);

    const jobCounts = await pool.query(`
      SELECT 
        COUNT(*) AS total_jobs,
        COUNT(*) FILTER (WHERE print_status = 'completed') AS completed_jobs,
        COUNT(*) FILTER (WHERE print_status = 'cancelled') AS cancelled_jobs
      FROM print_jobs
    `);

    res.json({
      dailyRevenue: Number(dailyRev.rows[0].daily),
      weeklyRevenue: Number(weeklyRev.rows[0].weekly),
      monthlyRevenue: Number(monthlyRev.rows[0].monthly),
      totalJobs: Number(jobCounts.rows[0].total_jobs),
      completedJobs: Number(jobCounts.rows[0].completed_jobs),
      cancelledJobs: Number(jobCounts.rows[0].cancelled_jobs),
    });
  } catch (err) {
    console.error("Reports Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch reports data" });
  }
});

// -----------------------------------------------------------------------------
// Notifications Endpoint
// -----------------------------------------------------------------------------

app.get("/admin/notifications", async (req, res) => {
  try {
    const notifications = [];
    const recentOrders = await pool.query("SELECT id, file_name, created_at FROM print_jobs ORDER BY created_at DESC LIMIT 5");

    recentOrders.rows.forEach((order) => {
      notifications.push({
        id: `order-${order.id}`,
        title: "New Print Order",
        message: `Order #${order.id} (${order.file_name || "Document"}) was placed.`,
        time: new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "order",
      });
    });

    try {
      const stoppedPrinters = await pool.query("SELECT id, name, status FROM printers WHERE LOWER(status) IN ('offline', 'error', 'stopped', 'out_of_paper')");
      stoppedPrinters.rows.forEach((printer) => {
        notifications.push({
          id: `printer-${printer.id}`,
          title: "Printer Alert",
          message: `Printer "${printer.name}" has stopped running (${printer.status}).`,
          time: "Just now",
          type: "alert",
        });
      });
    } catch (printerErr) {
      console.warn("Printers table check skipped:", printerErr.message);
    }

    res.json(notifications);
  } catch (err) {
    console.error("Notifications Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

app.delete("/admin/notifications/:id", async (req, res) => {
  res.json({ success: true, message: "Notification deleted successfully" });
});

// -----------------------------------------------------------------------------
// Admin Auth Endpoints
// -----------------------------------------------------------------------------

app.post("/admin/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

    const existingAdmin = await pool.query("SELECT id FROM admin_users WHERE email = $1", [email]);
    if (existingAdmin.rows.length > 0) return res.status(400).json({ message: "Admin account with this email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO admin_users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role`,
      [name, email, passwordHash]
    );

    res.status(201).json({ message: "Admin account created successfully", admin: result.rows[0] });
  } catch (error) {
    console.error("Admin Registration Error:", error);
    res.status(500).json({ message: "Failed to register admin" });
  }
});

app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const result = await pool.query("SELECT id, name, email, password_hash, role FROM admin_users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(401).json({ message: "Invalid email or password" });

    const admin = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) return res.status(401).json({ message: "Invalid email or password" });

    const initials = admin.name.split(" ").map((n) => n[0]).join("").toUpperCase();
    res.status(200).json({
      message: "Login successful",
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, avatarInitials: initials },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// -----------------------------------------------------------------------------
// Printers Endpoints (Dual Aliasing for /printers & /api/printers)
// -----------------------------------------------------------------------------

const getPrintersHandler = async (req, res) => {
  try {
    await pool.query(`UPDATE printers SET status = 'Offline' WHERE last_seen < NOW() - INTERVAL '30 seconds' AND status != 'Offline'`);
    const result = await pool.query("SELECT * FROM printers ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Printers Error:", err);
    res.status(500).json({ error: err.message });
  }
};

const heartbeatHandler = async (req, res) => {
  const { id, name, location, paper_level, queue_count, status } = req.body;
  if (!id) return res.status(400).json({ error: "Printer ID is required" });

  try {
    const query = `
      INSERT INTO printers (id, name, location, status, paper_level, queue_count, last_seen)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, printers.name),
        location = COALESCE(EXCLUDED.location, printers.location),
        status = EXCLUDED.status,
        paper_level = EXCLUDED.paper_level,
        queue_count = EXCLUDED.queue_count,
        last_seen = NOW();
    `;
    await pool.query(query, [id, name || `Printer ${id}`, location || "Main Kiosk", status || "Online", paper_level ?? 100, queue_count ?? 0]);
    res.json({ success: true, message: "Heartbeat updated" });
  } catch (err) {
    console.error("Heartbeat Error:", err);
    res.status(500).json({ error: err.message });
  }
};

const printerActionHandler = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  let newStatus = "Online";
  if (action === "pause") newStatus = "Paused";
  if (action === "resume") newStatus = "Online";
  if (action === "restart") newStatus = "Online";

  try {
    const result = await pool.query("UPDATE printers SET status = $1 WHERE id = $2 RETURNING *", [newStatus, id]);
    res.json({ success: true, printer: result.rows[0] });
  } catch (err) {
    console.error("Printer Action Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Aliased Printer Routes (Supports both direct and /api prefixes)
app.get("/printers", getPrintersHandler);
app.get("/api/printers", getPrintersHandler);

app.post("/printers/heartbeat", heartbeatHandler);
app.post("/api/printers/heartbeat", heartbeatHandler);

app.post("/printers/:id/action", printerActionHandler);
app.post("/api/printers/:id/action", printerActionHandler);
// Add this route in server.js
app.get("/settings", (req, res) => {
  res.json({
    siteName: "PrintEase",
    autoPrint: true,
    maxFileSizeMB: 10,
    allowedFormats: ["pdf"],
  });
});

app.put("/settings", (req, res) => {
  res.json({ message: "Settings updated successfully" });
});
// -----------------------------------------------------------------------------
// Server Start
// -----------------------------------------------------------------------------

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`PrintEase server running on http://0.0.0.0:${PORT}`);
});