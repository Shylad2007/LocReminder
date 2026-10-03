# LocReminder

**Remember it when you're there.**

🔗 **Live Website:** https://loc-reminder.vercel.app/

---

## The annoyance

- Normal reminders are usually time-based, but many tasks depend on **where you are**.
- Example: *"Return the library book when I'm at the library."*
- This is especially annoying for students and everyday users who remember a task only after leaving the relevant place.
- LocReminder was built to solve this gap between **remembering something** and **being at the right place to act on it**.

## The constraint

- The app had to be **fully usable with one thumb on a phone**.
- This directly influenced the design:
  - Large touch targets
  - Minimal typing
  - Easy-to-reach primary actions
  - Simple navigation
  - Mobile-first responsive layouts

## The great part

- **Location-based reminders** are the core feature.
- Users can create a reminder for a specific location or time.
- Locations can be saved and reused for future reminders.
- While the app is open, LocReminder checks the user's location and can notify them when they reach the saved place.
- This was chosen because it directly addresses the original annoyance rather than being another generic reminder app.

## The two testers

- **Tester 1:** Got stuck typing a reminder while using only one thumb.
  - Added a **voice input feature** so reminders can be captured without typing.

- **Tester 2:** Suggested that frequently used locations should be saved.
  - Added **saved locations**, allowing users to reuse locations instead of entering them again.

## AI

- Used AI to help:
  - Design and refine the UI
  - Implement parts of the React frontend
  - Implement backend/API functionality
  - Quickly debug crucial backend and deployment issues

- **One AI mistake that had to be fixed:**
  - The initial UI was not working properly on mobile and did not properly satisfy the one-thumb constraint.
  - After providing more specific guidance and manually refining the implementation, the mobile experience was corrected.
  - AI also initially used hardcoded `fetch()` URLs pointing to `localhost:5000`. During deployment, these were replaced with the `VITE_API_URL` environment variable so the frontend could communicate with the production backend.

## Not done

- Location detection works **while the web app is open**.
- Reliable background location notifications when the website is completely closed are not implemented.
- The app is currently an MVP and does not include native mobile background capabilities.

## Run it locally

### 1. Clone the repository

```bash
git clone https://github.com/Shylad2007/LocReminder.git
cd LocReminder
