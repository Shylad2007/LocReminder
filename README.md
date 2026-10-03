# LocReminder

[Live Website](https://loc-reminder.vercel.app/) | [GitHub Repository](https://github.com/Shylad2007/LocReminder)

A full-stack web application designed to solve a simple problem: **"Remember it when you're there."**

## 1. The Annoyance

**The Problem:** Normal time-based reminders are often useless because tasks are context-dependent. "Return library book" only matters when you're near the library. "Buy detergent" only matters at the supermarket.
**Who it annoys:** Anyone trying to run errands or manage location-specific tasks.
**How I identified it:** Personal frustration. I frequently remembered things I needed to do at specific places, but setting a time-based reminder rarely coincided with when I was actually at that location.

## 2. The Constraint

**"One thumb. Fully usable with one thumb on a phone."**

Because reminders are usually created on the go, the mobile experience had to be prioritized. This affected the design in several ways:
*   **Large touch targets:** Important actions are large and reachable.
*   **Minimal typing:** Extensive text input is tedious with one hand.
*   **Voice input:** Added a hold-to-speak microphone button for both the reminder text and location names.
*   **Reusable locations:** Users can save and select locations from a list instead of typing them out every time.
*   **Bottom-heavy layout:** Key actions and navigation are placed towards the bottom of the screen.

## 3. The Great Part

The main feature focused on is the **location-based reminder system**.

I chose to focus on this because it fundamentally changes how reminders trigger. Instead of relying on a clock, the app uses the browser's Geolocation API to check the user's current coordinates against their saved reminder locations, delivering a notification when they arrive.

## 4. The Two Testers

**Tester 1:**
*   **Feedback:** Got stuck typing a reminder while using only one thumb. It was too slow and frustrating.
*   **Change made:** Integrated the Web Speech API to allow voice input for creating reminders.

**Tester 2:**
*   **Feedback:** Suggested that frequently used locations (like "Home" or "Library") should be saved to avoid entering the same location repeatedly.
*   **Change made:** Implemented a "Saved Locations" feature where users can store and reuse specific coordinates.

## 5. AI Usage

AI was used throughout the development process:
*   **UI/UX:** Helped refine the visual design into a clean, tactile "Plinth" style.
*   **Debugging:** Quickly resolved backend routing, JWT auth logic, and deployment configuration issues.

**AI Mistakes:**
*   **Mobile UI:** The AI initially produced a dense, desktop-focused UI that completely failed the "one-thumb" constraint. It required specific guidance to increase touch targets and simplify the layout.
*   **API Configuration:** The AI originally hardcoded all frontend API calls to `http://localhost:5000`. This was caught during deployment preparation and fixed by implementing environment variables (`VITE_API_URL`).

## 6. Not Done

*   **Background Geolocation:** Location detection and notifications currently only work reliably while the web application is open/active in the browser. Reliable background GPS tracking when the browser is fully closed is not implemented, as it requires native mobile app permissions beyond the scope of a standard PWA/web app.

## 7. Run it Locally

To run this project locally on your machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Shylad2007/LocReminder.git
    cd LocReminder
    ```

2.  **Start the Backend:**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory with the following variables:
    *   `PORT`
    *   `MONGODB_URI`
    *   `JWT_SECRET`
    *   `FRONTEND_URL` (e.g., `http://localhost:5173`)
    ```bash
    npm run dev
    ```

3.  **Start the Frontend:**
    Open a new terminal window.
    ```bash
    cd frontend
    npm install
    ```
    Create a `.env` file in the `frontend` directory with the following variable:
    *   `VITE_API_URL` (e.g., `http://localhost:5000`)
    ```bash
    npm run dev
    ```
4.  Open the local Vite URL (usually `http://localhost:5173`) in your browser.

## 8. Tech Stack

*   **Frontend:** React, Vite, JavaScript, CSS (Custom Design System)
*   **Backend:** Node.js, Express
*   **Database:** MongoDB, Mongoose, MongoDB Atlas
*   **Authentication:** JWT, HttpOnly cookies, bcryptjs
*   **Web APIs:** Geolocation API, Notifications API, Web Speech API
*   **Deployment:** Vercel (Frontend), Render (Backend)
