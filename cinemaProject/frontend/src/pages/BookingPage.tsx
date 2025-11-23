import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
} from "react-router-dom";
import type { Movie } from "../types/Movie";
import { useEffect, useState } from "react";
import { fetchShowtimeSeats, createBooking } from "../data/api";
import { listCards, type PaymentCard } from "../data/auth";
import { useAuth } from "../contexts/AuthContext";

interface BookingPageProps {
  movies: Movie[];
}

const BookingPage = ({ movies }: BookingPageProps) => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const showtimeParam = searchParams.get("showtime");

  const movie = movies.find((m) => m.slug === slug);

  const selectedShowtime = movie?.showtimes.find((s) => {
    return (
      String(s.id) === showtimeParam ||
      s.startsAt === showtimeParam ||
      (s as any).starts_at === showtimeParam
    );
  });

  // Seat selection state
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [seatTypes, setSeatTypes] = useState<Record<number, string>>({});
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [savedCards, setSavedCards] = useState<PaymentCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Load saved cards
  useEffect(() => {
    const loadCards = async () => {
      if (!isAuthenticated) return;
      try {
        const cards = await listCards();
        setSavedCards(cards);
        if (cards.length > 0) setSelectedCardId(cards[0].id);
      } catch (e) {
        console.error("Failed to load cards", e);
      }
    };
    loadCards();
  }, [isAuthenticated]);

  // Load seats for showtime
  useEffect(() => {
    if (!selectedShowtime || !isAuthenticated) return;

    setLoadingSeats(true);
    fetchShowtimeSeats(Number(selectedShowtime.id))
      .then((data) => setSeats(data))
      .finally(() => setLoadingSeats(false));
  }, [selectedShowtime, isAuthenticated]);

  const toggleSeat = (seatId: number) => {
    setSelectedSeats((prev) => {
      const exists = prev.includes(seatId);
      const next = exists ? prev.filter((id) => id !== seatId) : [...prev, seatId];

      // default to ADULT when adding; remove type when removing
      setSeatTypes((current) => {
        const copy = { ...current };
        if (exists) {
          delete copy[seatId];
        } else {
          copy[seatId] = copy[seatId] || "ADULT";
        }
        return copy;
      });

      return next;
    });
  };

  // Handle booking
  const handleBooking = async () => {
    if (!selectedShowtime) return;

    if (!isAuthenticated) {
      alert("Please log in to book tickets.");
      navigate("/login");
      return;
    }

    const usingSavedCard = selectedCardId !== null;

    if (!usingSavedCard) {
      if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
        alert("Please enter payment details or choose a saved card.");
        return;
      }
    }

    const last4 = usingSavedCard
      ? savedCards.find((c) => c.id === selectedCardId)?.card_number_masked.slice(-4)
      : cardNumber.replace(/\D/g, "").slice(-4) || undefined;
    const seatPayload = selectedSeats.map((id) => ({
      seat: id,
      ticket_type: seatTypes[id] || "ADULT",
    }));

    try {
      const result = await createBooking(
        Number(selectedShowtime.id),
        seatPayload,
        {
          method: usingSavedCard ? "saved-card" : "card",
          card_last4: last4,
          card_id: usingSavedCard ? selectedCardId ?? undefined : undefined,
        }
      );
      console.log("Booking success:", result);

      navigate("/my-tickets"); // redirect to your tickets page
    } catch (err: any) {
      alert(err?.message || "Booking failed. Please try again.");
    }
  };

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Movie Not Found
          </h1>
          <Link
            to="/"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Please log in to book seats
          </h2>
          <div className="flex gap-3 justify-center">
            <Link
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatShowtime = (startsAt: string) => {
    const date = new Date(startsAt);
    return isNaN(date.getTime())
      ? startsAt
      : date.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Book Your Tickets
          </h1>

          {/* Movie Info Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-20 h-28 object-cover rounded"
              />
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {movie.title}
                </h2>
                <p className="text-gray-600">
                  {movie.genre} • {movie.rating}
                </p>
                <p className="text-blue-600 font-medium">
                  Selected Showtime:{" "}
                  {selectedShowtime
                    ? new Date(selectedShowtime.startsAt).toLocaleString(
                        undefined,
                        { dateStyle: "short", timeStyle: "short" }
                      )
                    : "Not selected"}
                </p>
              </div>
            </div>
          </div>

          {/* Showtime selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a Showtime
            </label>
            {movie.showtimes.length === 0 ? (
              <p className="text-gray-600">No showtimes available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {movie.showtimes.map((st) => {
                  const isActive = selectedShowtime && st.id === selectedShowtime.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        setSearchParams({ showtime: String(st.id) });
                        setSelectedSeats([]);
                      }}
                      className={`px-3 py-2 rounded border text-sm transition ${
                        isActive
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-800 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {formatShowtime(st.startsAt)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            {/* Seat Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seat Selection
              </label>

              {!selectedShowtime ? (
                <p className="text-gray-600 text-center py-4">
                  Choose a showtime to view available seats.
                </p>
              ) : loadingSeats ? (
                <p className="text-gray-600 text-center py-4">
                  Loading seats...
                </p>
              ) : (
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <p className="text-gray-600 mb-4">🎭 Theater Screen</p>

                  <div className="grid grid-cols-8 gap-2 max-w-md mx-auto">
                    {seats.map((seat) => {
                      const isSelected = selectedSeats.includes(
                        seat.id
                      );

                      return (
                        <button
                          key={seat.id}
                          onClick={() =>
                            !seat.isReserved && toggleSeat(seat.id)
                          }
                          className={`
                            w-8 h-8 rounded border text-xs
                            ${
                              seat.isReserved
                                ? "bg-red-300 cursor-not-allowed"
                                : ""
                            }
                            ${
                              isSelected
                                ? "bg-yellow-300"
                                : !seat.isReserved
                                ? "bg-green-200 hover:bg-green-300"
                                : ""
                            }
                          `}
                          disabled={seat.isReserved}
                        >
                          {seat.row}
                          {seat.number}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-sm text-gray-500 mt-4">
                    🟢 Available • 🔴 Taken • 🟡 Selected
                  </p>
                </div>
              )}
            </div>

            {/* Selected seat types */}
            {selectedSeats.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Ticket Types
                </h3>
                <div className="space-y-2">
                  {selectedSeats.map((seatId) => {
                    const seat = seats.find((s) => s.id === seatId);
                    return (
                      <div key={seatId} className="flex items-center justify-between">
                        <span className="text-gray-700">
                          Seat {seat?.row}
                          {seat?.number}
                        </span>
                        <select
                          value={seatTypes[seatId] || "ADULT"}
                          onChange={(e) =>
                            setSeatTypes((prev) => ({ ...prev, [seatId]: e.target.value }))
                          }
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="ADULT">Adult</option>
                          <option value="STUDENT">Student</option>
                          <option value="CHILD">Child</option>
                          <option value="SENIOR">Senior</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Payment Details
              </h3>
              {savedCards.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">Use a saved card</p>
                  <div className="space-y-2">
                    {savedCards.map((card) => (
                      <label
                        key={card.id}
                        className={`flex items-center justify-between border rounded px-3 py-2 ${
                          selectedCardId === card.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <div>
                          <p className="text-gray-800 text-sm font-medium">{card.card_holder_name}</p>
                          <p className="text-gray-600 text-sm">{card.card_number_masked}</p>
                          <p className="text-gray-500 text-xs">
                            Exp {card.expiry_month}/{card.expiry_year}
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="savedCard"
                          checked={selectedCardId === card.id}
                          onChange={() => setSelectedCardId(card.id)}
                        />
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-sm text-blue-600 hover:underline"
                    onClick={() => setSelectedCardId(null)}
                  >
                    Use a different card
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Jane Doe"
                    disabled={selectedCardId !== null}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="4242 4242 4242 4242"
                    disabled={selectedCardId !== null}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="12/29"
                    disabled={selectedCardId !== null}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">CVC</label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="123"
                    disabled={selectedCardId !== null}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Payments are simulated for now; card data is not stored.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Link
                to={`/movie/${movie.slug}`}
                className="flex-1 bg-gray-500 text-white text-center py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Movie Details
              </Link>

              <button
                onClick={handleBooking}
                disabled={selectedSeats.length === 0}
                className={`flex-1 py-3 rounded-lg text-white transition-colors ${
                  selectedSeats.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                Confirm Booking
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Select your seats and confirm your
              booking. Payment will be added once your checkout flow is
              implemented.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
