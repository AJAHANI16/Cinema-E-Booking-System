# My Tickets Page - Edge Case Test Checklist

## Prerequisites Setup
- [ ] Backend server running on `http://localhost:8000`
- [ ] Frontend server running on `http://localhost:5173`
- [ ] Database has test data (run `python seed.py` if needed)

---

## 1. Authentication & Authorization Tests

### Not Logged In
- [ ] Navigate to `/my-tickets` while logged out
- [ ] **Expected**: Should show error message "Please log in to view your bookings"
- [ ] **Expected**: Error screen should have "Log In" button
- [ ] Click "Log In" button
- [ ] **Expected**: Redirects to login page

### Newly Registered User (No Customer Profile)
- [ ] Register a brand new user account
- [ ] Verify email and log in
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: Should show empty state "No Bookings Yet"
- [ ] **Expected**: Customer profile should be auto-created in database
- [ ] **Expected**: No error messages

### Logged In User Without Bookings
- [ ] Log in with existing user who has never booked tickets
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: "No Bookings Yet" message with ticket icon
- [ ] **Expected**: "Browse Movies" button is visible
- [ ] Click "Browse Movies"
- [ ] **Expected**: Redirects to home page

---

## 2. Booking Display Tests

### Single Booking with Single Ticket
- [ ] Create a booking with 1 ticket for an upcoming showtime
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: Booking card displays correctly
- [ ] **Expected**: Shows booking ID, total amount, status (CONFIRMED)
- [ ] **Expected**: Displays seat number (e.g., "A5")
- [ ] **Expected**: Shows movie title, showtime, room name
- [ ] **Expected**: Shows ticket type (ADULT/STUDENT/CHILD/SENIOR) and price

### Single Booking with Multiple Tickets
- [ ] Create a booking with 3+ tickets for the same showtime
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: All tickets listed under one booking card
- [ ] **Expected**: Each ticket shows different seat numbers
- [ ] **Expected**: Total amount matches sum of all ticket prices
- [ ] **Expected**: Tickets are visually separated (alternating backgrounds)

### Multiple Bookings
- [ ] Create 3+ separate bookings (different movies/times)
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: All bookings display as separate cards
- [ ] **Expected**: Most recent booking appears first
- [ ] **Expected**: Each booking is clearly separated

---

## 3. Upcoming vs Past Bookings

### Upcoming Showtime
- [ ] Create a booking for a showtime 2 days in the future
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: Appears in "Upcoming Shows" section
- [ ] **Expected**: Section header shows count badge (e.g., "1")
- [ ] **Expected**: Card has blue border
- [ ] **Expected**: Section has green clock icon

### Past Showtime
- [ ] Create a booking for a showtime in the past (or wait for one to pass)
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: Appears in "Past Shows" section
- [ ] **Expected**: Section header shows count badge
- [ ] **Expected**: Card has gray border
- [ ] **Expected**: Section is slightly transparent (opacity-75)
- [ ] **Expected**: Section has gray clock icon

### Mixed Upcoming and Past
- [ ] Have both upcoming and past bookings
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: Both sections display
- [ ] **Expected**: Upcoming shows section appears first
- [ ] **Expected**: Past shows section appears second
- [ ] **Expected**: Counts are accurate in badges

### Showtime Starting Today
- [ ] Create a booking for a showtime later today (but hasn't started yet)
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: Appears in "Upcoming Shows"
- [ ] After the showtime passes, refresh page
- [ ] **Expected**: Moves to "Past Shows"

---

## 4. Booking Status Tests

### CONFIRMED Status
- [ ] View a booking with CONFIRMED status
- [ ] **Expected**: Green badge with "CONFIRMED" text

### PENDING Status
- [ ] Change a booking status to PENDING in database
- [ ] Refresh `/my-tickets`
- [ ] **Expected**: Yellow badge with "PENDING" text

### CANCELLED Status
- [ ] Change a booking status to CANCELLED in database
- [ ] Refresh `/my-tickets`
- [ ] **Expected**: Red badge with "CANCELLED" text
- [ ] **Expected**: Appears in "Past Shows" regardless of showtime date

---

## 5. Promo Code Display

### Booking Without Promo Code
- [ ] Create a booking without using a promo code
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: No promo code badge displayed

### Booking With Promo Code
- [ ] Create a promo code in admin (e.g., "SAVE20")
- [ ] Create a booking using the promo code
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: Green badge displays "Promo: SAVE20"
- [ ] **Expected**: Total amount reflects discount

---

## 6. Movie & Showtime Details

### Complete Showtime Information
- [ ] View booking with all showtime fields populated
- [ ] **Expected**: Movie title displays correctly
- [ ] **Expected**: Showtime displays with day, date, and time
- [ ] **Expected**: Room name displays
- [ ] **Expected**: Format badge displays (2D/3D/IMAX/DOLBY) if set

### Missing Optional Fields
- [ ] Create showtime without format specified
- [ ] Create booking
- [ ] **Expected**: No format badge displays (graceful degradation)

### Movie Link
- [ ] Click "View Details" link on a ticket
- [ ] **Expected**: Navigates to movie detail page
- [ ] **Expected**: Shows correct movie information

---

## 7. Error Handling & Recovery

### Network Error
- [ ] Stop the backend server
- [ ] Navigate to `/my-tickets` or refresh
- [ ] **Expected**: Error message "Unable to connect to the server"
- [ ] **Expected**: Shows warning icon
- [ ] **Expected**: "Try Again" button is visible
- [ ] Start backend server
- [ ] Click "Try Again"
- [ ] **Expected**: Loads bookings successfully

### Session Expired
- [ ] Log in
- [ ] Clear session cookies manually (browser dev tools)
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: Error message about authentication
- [ ] **Expected**: Shows "Log In" button

### Slow Network
- [ ] Throttle network to slow 3G (browser dev tools)
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: Loading spinner displays
- [ ] **Expected**: "Loading your tickets..." message shows
- [ ] **Expected**: Eventually loads when complete

---

## 8. UI/UX Tests

### Loading State
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: Spinning loader displays immediately
- [ ] **Expected**: "Loading your tickets..." message visible
- [ ] **Expected**: Content appears when loaded

### Responsive Design - Mobile
- [ ] Resize browser to mobile width (375px)
- [ ] **Expected**: Booking cards stack vertically
- [ ] **Expected**: All information is readable
- [ ] **Expected**: Buttons are easily tappable
- [ ] **Expected**: No horizontal scroll

### Responsive Design - Tablet
- [ ] Resize browser to tablet width (768px)
- [ ] **Expected**: Layout adjusts appropriately
- [ ] **Expected**: Good use of space

### Responsive Design - Desktop
- [ ] View on full desktop width (1920px)
- [ ] **Expected**: Content is centered with max-width
- [ ] **Expected**: Not too wide or stretched

---

## 9. Date & Time Formatting

### Different Locales
- [ ] View bookings in different browser language settings
- [ ] **Expected**: Dates format according to locale
- [ ] **Expected**: Times show in 12/24 hour format per locale

### Timezone Handling
- [ ] Create booking with specific showtime
- [ ] View on `/my-tickets`
- [ ] **Expected**: Shows in user's local timezone
- [ ] **Expected**: Date/time is intuitive and clear

---

## 10. Edge Cases & Boundary Conditions

### Very Long Movie Title
- [ ] Create movie with title > 100 characters
- [ ] Create booking
- [ ] **Expected**: Title displays without breaking layout
- [ ] **Expected**: Text wraps properly

### Large Number of Tickets
- [ ] Create booking with 10+ tickets
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: All tickets display
- [ ] **Expected**: Page doesn't become unusable
- [ ] **Expected**: Scrolling works smoothly

### Large Number of Bookings
- [ ] Create 20+ bookings for one user
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: All bookings display
- [ ] **Expected**: Page loads in reasonable time (< 3 seconds)
- [ ] **Expected**: No performance issues

### Price Edge Cases
- [ ] Booking with $0.00 amount (100% discount)
- [ ] **Expected**: Displays $0.00 correctly
- [ ] Booking with large amount ($999.99+)
- [ ] **Expected**: Displays correctly with proper formatting

### Special Characters in Data
- [ ] Movie title with special characters (é, ñ, 中文, emoji)
- [ ] **Expected**: Displays correctly
- [ ] Promo code with special characters
- [ ] **Expected**: Displays correctly

---

## 11. Browser Compatibility

### Modern Browsers
- [ ] Test in Chrome/Edge (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] **Expected**: Consistent appearance and functionality

### Console Errors
- [ ] Open browser console on `/my-tickets`
- [ ] **Expected**: No JavaScript errors
- [ ] **Expected**: No React warnings in development mode

---

## 12. Accessibility

### Keyboard Navigation
- [ ] Navigate page using only Tab key
- [ ] **Expected**: Can reach all interactive elements
- [ ] **Expected**: Focus indicators are visible
- [ ] Press Enter on "Try Again" button (in error state)
- [ ] **Expected**: Retries loading

### Screen Reader (Optional)
- [ ] Use screen reader to navigate page
- [ ] **Expected**: Content is announced logically
- [ ] **Expected**: Buttons have clear labels

---

## 13. Data Integrity

### Refresh Page
- [ ] Load `/my-tickets` with bookings
- [ ] Refresh the page (Cmd+R or F5)
- [ ] **Expected**: Same data displays
- [ ] **Expected**: No duplicates

### Concurrent Users
- [ ] Log in as User A, view bookings
- [ ] Log in as User B in different browser
- [ ] **Expected**: Each user sees only their bookings
- [ ] **Expected**: No data leakage between users

### Database Changes
- [ ] View bookings on page
- [ ] Manually update booking in database (e.g., change status)
- [ ] Refresh page
- [ ] **Expected**: Updated data displays correctly

---

## 14. Integration with Other Features

### After Creating New Booking
- [ ] Go through full booking flow
- [ ] Complete payment
- [ ] **Expected**: Success message/redirect
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: New booking appears at top
- [ ] **Expected**: Status is CONFIRMED

### After Profile Update
- [ ] Update profile information
- [ ] Navigate to `/my-tickets`
- [ ] **Expected**: Page loads normally
- [ ] **Expected**: No impact on bookings display

---

## Quick Test Script (Happy Path)

1. [ ] Register new user → verify → login
2. [ ] Create booking for upcoming movie
3. [ ] Go to `/my-tickets`
4. [ ] Verify booking displays in "Upcoming Shows"
5. [ ] Click "View Details" link
6. [ ] Return to `/my-tickets`
7. [ ] Log out
8. [ ] Try accessing `/my-tickets`
9. [ ] Verify error message
10. [ ] Log back in
11. [ ] Verify booking still visible

---

## Notes
- Record any bugs found: ________________________________
- Screenshots of issues: _______________________________
- Performance issues: __________________________________
- Suggestions for improvement: _________________________
