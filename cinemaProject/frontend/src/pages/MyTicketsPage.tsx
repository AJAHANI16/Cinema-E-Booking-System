import { useEffect, useState } from "react";
import { fetchMyBookings } from "../data/api";
import { Link } from "react-router-dom";

interface TicketShowtime {
  id: number;
  starts_at: string;
  format?: string;
  movie_title?: string;
  movie_slug?: string;
  movie_room_name?: string;
}

interface TicketSeat {
  id: number;
  row: string;
  number: number;
}

interface Ticket {
  id: number;
  seat: TicketSeat;
  price: number;
  ticket_type: string;
  showtime: TicketShowtime;
}

interface Booking {
  id: number;
  created_at: string;
  status: string;
  total_amount: number;
  promo_code?: string;
  tickets: Ticket[];
}

const MyTicketsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const data = await fetchMyBookings();
        setBookings(data);
      } catch (err: any) {
        console.error("Failed to load bookings:", err);
        // Parse different error types
        let errorMessage = "Failed to load your bookings.";
        if (err.message?.includes("Customer profile missing")) {
          errorMessage = "Your account is not fully set up. Please complete a booking first.";
        } else if (err.message?.includes("401") || err.message?.includes("authentication")) {
          errorMessage = "Please log in to view your bookings.";
        } else if (err.message?.includes("Network") || err.message?.includes("fetch")) {
          errorMessage = "Unable to connect to the server. Please check your connection.";
        } else if (err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setRetryCount((prev) => prev + 1);
  };

  // Separate bookings into upcoming and past
  const now = new Date();
  const upcomingBookings = bookings.filter((booking) => {
    const showtime = booking.tickets[0]?.showtime?.starts_at;
    return showtime && new Date(showtime) >= now && booking.status !== "CANCELLED";
  });
  const pastBookings = bookings.filter((booking) => {
    const showtime = booking.tickets[0]?.showtime?.starts_at;
    return (showtime && new Date(showtime) < now) || booking.status === "CANCELLED";
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-50 text-green-700 border-green-200";
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Bookings</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Try Again
            </button>
            <Link
              to="/"
              className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              Browse Movies
            </Link>
            {error.includes("log in") && (
              <Link
                to="/login"
                className="block w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderBookingCard = (booking: Booking, isUpcoming: boolean) => {
    const firstShowtime = booking.tickets[0]?.showtime;
    const showtimeDate = firstShowtime?.starts_at ? new Date(firstShowtime.starts_at) : null;
    const isExpired = showtimeDate && showtimeDate < now;

    return (
      <div
        key={booking.id}
        className={`bg-white rounded-lg shadow-md border-2 overflow-hidden ${
          isUpcoming && !isExpired ? "border-blue-200" : "border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <p className="text-sm font-medium text-gray-500">
                  Booking #{booking.id}
                </p>
              </div>
              <p className="text-xs text-gray-600">
                Booked on {new Date(booking.created_at).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-800">
                  ${Number(booking.total_amount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          {booking.promo_code && (
            <div className="mt-2 inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium border border-green-200">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              Promo: {booking.promo_code}
            </div>
          )}
        </div>

        {/* Tickets */}
        <div className="p-5">
          <div className="space-y-4">
            {booking.tickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 rounded-lg border ${
                  index === 0 ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {ticket.seat.row}{ticket.seat.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {ticket.showtime?.movie_title ?? "Movie"}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <strong>Showtime:</strong>
                          {ticket.showtime?.starts_at
                            ? new Date(ticket.showtime.starts_at).toLocaleString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : "TBD"}
                        </p>
                        <p className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <strong>Room:</strong> {ticket.showtime?.movie_room_name || "N/A"}
                          {ticket.showtime?.format && (
                            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                              {ticket.showtime.format}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:text-right lg:border-l lg:pl-4 space-y-2">
                  <div className="flex lg:flex-col items-center lg:items-end gap-2">
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                      {ticket.ticket_type}
                    </span>
                    <p className="text-xl font-bold text-gray-900">
                      ${Number(ticket.price).toFixed(2)}
                    </p>
                  </div>
                  {ticket.showtime?.movie_slug && (
                    <Link
                      to={`/movie/${ticket.showtime.movie_slug}`}
                      className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline font-medium"
                    >
                      View Details
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Tickets
          </h1>
          <p className="text-gray-600">
            View and manage your movie bookings
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No Bookings Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't made any movie bookings. Start by browsing our current movies!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Upcoming Shows
                  </h2>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                    {upcomingBookings.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => renderBookingCard(booking, true))}
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Past Shows
                  </h2>
                  <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm font-semibold">
                    {pastBookings.length}
                  </span>
                </div>
                <div className="space-y-4 opacity-75">
                  {pastBookings.map((booking) => renderBookingCard(booking, false))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;
