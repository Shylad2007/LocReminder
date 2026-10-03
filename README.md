# LocReminder

**Remember it when you're there.**

## The annoyance
People often remember something they need to do, but the reminder is useful only when they reach the right context (like a specific location or time). Most reminder apps are primarily based around time, but often the right reminder is triggered by location, e.g., "Return my library book" when you're actually at the library.

## The constraint
The primary constraint was **ONE THUMB** - the application must be fully usable with one thumb on a phone. This changed the design by forcing primary actions (like "REMEMBER SOMETHING" or "NEXT") to be large, easy to tap, and positioned near the bottom of the screen. Navigation menus were eliminated in favor of a straightforward, linear flow.

## The great part
I focused primarily on the **Location Context Flow**, **One-Thumb UI**, and **Memory Catch**. 

The app features **Reusable Saved Locations**, so users don't have to repeatedly capture GPS coordinates for places they visit often. Additionally, I implemented **Voice Location Naming** (and voice reminder capture) using the browser-native `SpeechRecognition` API. By making the microphone button a large "hold-to-speak" target, it adheres perfectly to the one-thumb design constraint and makes capturing thoughts extremely fast before they disappear.
## The two testers
### Tester 1
* Where tester 1 got stuck: [To be filled after testing]
* What changed afterward: [To be filled after testing]

### Tester 2
* Where tester 2 got stuck: [To be filled after testing]
* What changed afterward: [To be filled after testing]

## AI
* What AI tools were used for: Scaffolding the initial project structure, generating the CSS boilerplate, and brainstorming the simple location-distance logic.
* What they helped with: Rapidly creating a responsive, mobile-first UI with the "one-thumb" constraint in mind.
* One thing AI got wrong: Initially suggested using complex background geolocation APIs which was out of scope for the MVP.
* How it was fixed: Reverted to a simple foreground `watchPosition` logic that only checks when the app is open.

## Not done
* Background location tracking when the app is closed.
* Push notifications (using visual indicators instead).
* User authentication.
* Editing existing reminders.

## Run it

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm start
```

### Environment Variables
For the backend, you can set the following in `backend/.env`:
* `PORT`
* `MONGO_URI`
