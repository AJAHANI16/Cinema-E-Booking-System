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
  tickets: Ticket[];
}

const MyTicketsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyBookings();
        setBookings(data);
      } catch (err: any) {
        setError(err.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading your tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          My Tickets
        </h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">
              You don't have any bookings yet.
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow p-5 border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Booking #{booking.id}
                    </p>
                    <p className="text-gray-700">
                      {new Date(booking.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {booking.status}
                    </span>
                    <span className="font-semibold text-gray-800">
                      ${Number(booking.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {booking.tickets.map((ticket) => (
                    <div key={ticket.id} className="py-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {ticket.showtime?.movie_title ?? "Movie"}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Seat: {ticket.seat.row}
                            {ticket.seat.number}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Showtime:{" "}
                            {ticket.showtime?.starts_at
                              ? new Date(ticket.showtime.starts_at).toLocaleString(undefined, {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })
                              : "TBD"}
                          </p>
                          {ticket.showtime?.movie_room_name && (
                            <p className="text-gray-600 text-sm">
                              Room: {ticket.showtime.movie_room_name}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-gray-700">
                            {ticket.ticket_type} — ${Number(ticket.price).toFixed(2)}
                          </p>
                          {ticket.showtime?.movie_slug && (
                            <Link
                              to={`/movie/${ticket.showtime.movie_slug}`}
                              className="text-blue-600 text-sm hover:underline"
                            >
                              View movie
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;
