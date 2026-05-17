# 🤖 Smart Helpdesk System with AI

A full-stack AI-powered helpdesk system built with **React**, **Node.js**, **MongoDB** and **Groq AI (Llama 3)**.

---

## 📁 Project Structure

```
Smart-Helpdesk-System-AI/
├── backend/                  # Node.js + Express API
│   ├── controllers/
│   │   └── aiController.js   # Groq AI integration
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   └── upload.js         # Multer file upload
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Ticket.js         # Ticket + Messages schema
│   ├── routes/
│   │   ├── auth.js           # Auth routes
│   │   ├── tickets.js        # Ticket CRUD routes
│   │   └── ai.js             # AI suggestion route
│   ├── utils/
│   │   └── emailService.js   # Nodemailer email service
│   ├── uploads/              # Uploaded images stored here
│   ├── .env.example          # Environment variables template
│   ├── .gitignore
│   ├── package.json
│   └── server.js             # Main entry point + Socket.io
│
└── frontend/                 # React + Vite SPA
    ├── src/
    │   ├── api/
    │   │   └── axios.js           # Axios instance
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── TicketCard.jsx
    │   │   ├── CreateTicketModal.jsx
    │   │   ├── StarRating.jsx
    │   │   ├── NotificationBell.jsx
    │   │   └── Toast.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── SocketContext.jsx
    │   │   ├── NotificationContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── TicketDetail.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    └── package.json
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 JWT Authentication | Secure login/register with token-based auth |
| 🎭 Role-Based Access | User, Agent, Admin roles |
| 🎫 Ticket Management | Create, view, filter, update tickets |
| 🤖 AI Auto-Response | Groq Llama 3 responds instantly |
| 💬 Real-Time Chat | Socket.io live messaging |
| 📊 Analytics Charts | Recharts pie, bar, area charts |
| ⭐ Ticket Rating | 1–5 star feedback after resolution |
| 📧 Email Notifications | Gmail alerts on ticket updates |
| 📎 File Attachments | Upload images in chat |
| 🔔 Notification Bell | Real-time unread count |
| 🌙 Dark/Light Mode | Theme toggle with localStorage |

---

## 🛠️ Prerequisites

Make sure these are installed on your computer:

- **Node.js** v18 or higher → https://nodejs.org
- **MongoDB** (local) → https://www.mongodb.com/try/download/community
- **Git** → https://git-scm.com/download/win
- **Groq API Key** (free) → https://console.groq.com

---

## 🚀 Setup & Run — Step by Step

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Naksha-123/Smart-Helpdesk-System-with-AI.git
cd Smart-Helpdesk-System-with-AI
```

---

### Step 2 — Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

Verify MongoDB is running:
```bash
mongosh
```
Type `exit` to quit the shell.

---

### Step 3 — Setup Backend

```bash
cd backend
npm install
```

Create the `.env` file:
```bash
cp .env.example .env
```

Open `.env` and fill in your values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/helpdesk
JWT_SECRET=your_super_secret_key_here_123456
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

#### How to get Groq API Key (FREE):
1. Go to → https://console.groq.com
2. Sign up with Google
3. Click **API Keys → Create API Key**
4. Copy the key starting with `gsk_...`

#### How to get Gmail App Password:
1. Go to → https://myaccount.google.com
2. Security → 2-Step Verification → Turn ON
3. Search **App Passwords**
4. Create password for **Mail**
5. Copy the 16-character password (remove spaces)

---

### Step 4 — Run Backend

```bash
npm run dev
```

✅ You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
```

Test API: http://localhost:5000/api/health

---

### Step 5 — Setup Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
```

---

### Step 6 — Run Frontend

```bash
npm run dev
```

✅ You should see:
```
VITE v5.x.x  ready
➜  Local:   http://localhost:5173/
```

---

### Step 7 — Open in Browser

Go to → **http://localhost:5173**

---

## 👤 Create Test Accounts

Register these accounts to test all features:

| Role | Name | Email | Password |
|---|---|---|---|
| Admin | Admin User | admin@test.com | 123456 |
| Agent | Support Agent | agent@test.com | 123456 |
| User | John Doe | user@test.com | 123456 |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/users` | List all users (Admin) |

### Tickets
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tickets` | Create ticket (AI responds) |
| GET | `/api/tickets` | List tickets |
| GET | `/api/tickets/stats` | Dashboard statistics |
| GET | `/api/tickets/:id` | Get single ticket |
| PATCH | `/api/tickets/:id` | Update status/priority |
| POST | `/api/tickets/:id/message` | Add message (AI replies) |
| POST | `/api/tickets/:id/rate` | Rate a resolved ticket |
| POST | `/api/tickets/:id/upload` | Upload image attachment |
| DELETE | `/api/tickets/:id` | Delete ticket (Admin) |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/suggest` | Get AI suggestion |

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| MongoDB not connecting | Run `net start MongoDB` (Windows) |
| Port 5000 in use | Change `PORT=5001` in `.env` |
| AI not responding | Check `GROQ_API_KEY` in `.env` |
| Emails not sending | Verify Gmail App Password (not regular password) |
| Blank white page | Check browser console (Ctrl+Shift+I) for errors |
| `npm not found` | Install Node.js from https://nodejs.org |
| `module not found` | Run `npm install` in both backend and frontend folders |

---

## 🧰 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | 18 |
| Build Tool | Vite | 5 |
| Routing | React Router | 6 |
| Backend | Node.js + Express | Latest |
| Database | MongoDB + Mongoose | 8 |
| AI | Groq API (Llama 3) | Latest |
| Real-time | Socket.io | Latest |
| Auth | JWT + bcryptjs | Latest |
| Email | Nodemailer | Latest |
| File Upload | Multer | Latest |
| Charts | Recharts | Latest |
| Icons | Lucide React | Latest |

---

## 📸 How to Test Features

### 1. AI Auto-Response
- Login as User → Submit a new ticket → Wait 2-3 seconds → AI replies automatically

### 2. Real-Time Chat
- Open 2 browser windows (one normal, one incognito)
- Login as User in Window 1, Agent in Window 2
- Open same ticket → messages appear instantly without refresh

### 3. Ticket Rating
- Agent changes ticket status to **Resolved**
- Login as User → Open the ticket → Rate with stars

### 4. File Attachments
- Open any ticket → Click 📎 paperclip button → Upload any image

### 5. Admin Charts
- Login as Admin → Go to Admin Panel → Click **Charts** tab

### 6. Notification Bell
- Agent sends a message on user's ticket → Bell shakes with red count

### 7. Dark/Light Mode
- Click the 🌙 moon / ☀️ sun icon in navbar

---




Built by **Naksha** as an internship project — 2026

GitHub: https://github.com/Naksha-123/Smart-Helpdesk-System-with-AI
