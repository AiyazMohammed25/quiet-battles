# QUIET BATTLES™ | Full-Stack Web Development Demo

A cinematic, high-end full-stack web application built for the **QUIET BATTLES™** ("WEAR YOUR BATTLES") technical assessment for Pholus Globos Facility Service Pvt. Ltd.

---

## 🚀 Live Preview & Demo
- **Live Staging URL:** [Add your Vercel deployment link here]
- **Repository:** [Add your GitHub repository link here]

---

## 🛠️ Technology Stack

- **Frontend Framework:** Next.js (App Router) with React Server & Client Components
- **Styling:** Tailwind CSS (Custom dark-mode luxury streetwear design system)
- **State Management:** Zustand (Handling reactive cart drawer and state)
- **Backend & Database:** Node.js, Next.js API Routes / Server Actions, MongoDB (Mongoose)
- **Icons & UI Enhancements:** Lucide React
- **Deployment & Hosting:** Vercel

---

## ✨ Key Features Implemented

1. **Cinematic Homepage:** Implements the core brand identity and tagline *"WEAR YOUR BATTLES"* with immersive dark-mode aesthetics (`#0a0a0a` carbon black theme).
2. **The Archive & Chapters:** Showcases *SERIES 01 – THE GENTLE ARMOR™* through 5 interactive, dynamic chapter routes featuring rich editorial storytelling.
3. **Product & E-Commerce Flow:** Product pages include an interactive size selector (S to XXL) and a Zustand cart drawer. Cart contents are saved in browser `localStorage`, so they remain after a reload; checkout and inventory reservation are not implemented.
4. **Admin CMS Dashboard (`/admin`):** Administrators can create, read, update, and delete Series, Chapters, and Products in MongoDB. New chapters default to the next available number in the selected series.

---

## 💻 Getting Started Locally

To run this project on your local machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/quiet-battles.git](https://github.com/your-username/quiet-battles.git)
   cd quiet-battles
Install dependencies:

Bash
npm install
Set up environment variables:
Create a .env file in the root directory and add your MongoDB connection string:

Code snippet
MONGO_URI=your_mongodb_connection_string_here
Run the development server:

Bash
npm run dev
Open http://localhost:3000 in your browser to view the application.

👤 Author
Mohammad Aiyaz Makandar

Full-Stack Developer (MGC / Next.js / React Native)