# Cinema E-Booking System

## Problem Statement

The online booking system manages one theatre with a few employees and halls. It stores information about thousands of movies, showtimes, and registered customers.

The system is a web-based application that allows internet users to:

- View information about movies.
- Book tickets and seats online.
- Pay for tickets online and save or print them.

The system also stores registered user data and provides registration functionality. Administrators can add and update movies, ticket prices, and user information, as well as view real-time statistics about bookings, sales, running movies, and registered users.

Ticket prices vary by age category: **Child**, **Adult**, and **Senior**.

---

## Development Process

The software will be developed following a hybrid model that combines **Waterfall** and **Agile**:

- **Waterfall**: Used for overall project planning, phases, and deliverables.
- **Agile**: Injected within planned phases to refine requirements before each sprint, produce early working versions, and incorporate continuous testing.

**Highlights:**
- Coding is scheduled in sprints.
- Teams can work concurrently (e.g., UI design while building database tables).
- Prototypes will be used for UI feedback to reduce risk of failure.
- Final testing will include subsystem, integration, and acceptance testing.

📅 Final project demonstration: **Tuesday, 11/30/2022**.

---

## High-Level System Requirements

### Movie Management
- Administrators can enter, update, or delete movie information.
- Each movie record must include:
  - Title
  - Category
  - Cast
  - Director
  - Producer
  - Synopsis
  - Reviews
  - Trailer picture and video
  - MPAA-US film rating code [[1]](https://www.filmratings.com/)
  - Show dates and times

### Ticket & Promotions Management
- Administrators can set ticket prices, online booking fees, and promotions.
- Promotions must be sent via email to subscribed users.

### User Registration
- Users must provide:
  - Password
  - Personal info (name, phone, email)
  - Optional payment and home address details
- Users can store:
  - One shipping address
  - Up to three payment cards
- Registration requires email verification.
- Each email corresponds to one unique account ID.
- Users can reset forgotten passwords securely.
- Registered users can:
  - Subscribe/unsubscribe to promotions.
  - View/modify their profile (but not change email).

### Booking & Checkout
- Users must be registered and signed-in to book.
- Features include:
  - Browse/filter/search movies by category, title, or show date.
  - Select movie, show date/time, ticket quantity, and age category.
  - Graphical seat selection.
  - Secured checkout with promotion codes.
  - Booking confirmation page and email with:
    - Booking number
    - Order details
    - Total price (tickets + tax + online fees)
- Users can view order history.
- Tickets may be refunded if canceled up to 60 minutes before showtime (low priority).

### Administration & Reports
- Administrators can add/remove other admins, suspend accounts, and manage user info.
- System must provide multi-user access with proper authorization levels.
- Authentication via user ID and password.
- Managers/administrators can pull reports (sales, show reports).

### System & UI
- Persistent datastore (e.g., MySQL, SQLite).
- Standards compliance (HTML, CGI, SQL, JDBC/ODBC).
- Code in **Java** or **C++** (with PHP/JavaScript if needed).
- Web-based UI accessible via modern browsers.
- Easy-to-use, role-specific UI.

---

## References

[1] [Film Ratings](https://www.filmratings.com/)