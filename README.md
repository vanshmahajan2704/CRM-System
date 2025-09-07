## 🌟 CRM Application - Your Customer Relationship Companion

Welcome to your new CRM application! This is a beautiful, modern system designed to help you manage customer relationships effortlessly. Built with cutting-edge technology, it combines a sleek React frontend with a powerful Node.js backend to give you a seamless experience.


**Frontend Magic ✨**: A stunning interface built with React 18, featuring lightning-fast Vite, beautiful Tailwind CSS styling, smart forms with React Hook Form, friendly notifications with Hot Toast, and gorgeous icons from Lucide.

**Backend Power 💪**: A robust Express.js server with MongoDB database, secure JWT authentication, intelligent rate limiting, and iron-clad security headers to keep your data safe.

## 🚀 Let's Get Started!

### Step 1: Install the Goodies
First, let's get all the necessary packages installed. Open your terminal and run:

*Navigate to the server folder and type `npm install` - this will grab all the backend ingredients*
*Then pop over to the client folder and run `npm install` again - this time for the frontend goodies*

### Step 2: Environment Setup
Create a new file called `.env` in your server folder with these settings:

- **PORT=5000** (this is where your backend will live)
- **MONGODB_URI=mongodb://localhost:27017/crm-db** (your database address)
- **JWT_SECRET=make-this-super-secret-and-unique** (your security key - make it strong!)
- **JWT_EXPIRE=7d** (how long login sessions last)
- **NODE_ENV=development** (we're in development mode)
- **CLIENT_URL=http://localhost:3000** (where your frontend lives)

### Step 3: Fire It Up! 🎆
Time to see your CRM in action! You'll need two terminal windows:

*Terminal 1*: Go to the server folder and type `npm run dev` - your backend will spring to life on port 5000!

*Terminal 2*: Visit the client folder and type `npm run dev` - your beautiful frontend will appear on port 3000!

### Step 4: Enjoy the View 🌈
Open your favorite browser and visit:
- **http://localhost:3000** for the gorgeous CRM interface
- **http://localhost:5000** if you want to see the API in action

## 🛠 Handy Commands to Remember

**For the Frontend**:
- `npm run dev` - Start the development server (your creative playground)
- `npm run build` - Create a production-ready build (when you're ready to show the world)
- `npm run preview` - Take a sneak peek at your production build

**For the Backend**:
- `npm run dev` - Development mode with auto-restart (perfect for coding)
- `npm start` - Production mode (for when you're live)

## 🆘 Help! Something's Not Right

**Port Problems?** 😵
If ports 3000 or 5000 are being fussy, try: `npx kill-port 3000` or `npx kill-port 5000` to gently persuade them to behave.

**Module Mayhem?** 🎭
If dependencies are misbehaving: delete the `node_modules` folder and `package-lock.json`, then run `npm install` for a fresh start.

**Database Drama?** 🗄️
- Make sure MongoDB is running on your machine
- Double-check your connection string in the .env file
- Sometimes a quick MongoDB restart works wonders

**Login Issues?** 🔑
- Verify your JWT secret is properly set
- Check those environment variables one more time

---

🎉 **You're all set! Welcome to your new CRM - may it bring you many happy customer relationships and productive days!** 

💖 *Happy coding!*