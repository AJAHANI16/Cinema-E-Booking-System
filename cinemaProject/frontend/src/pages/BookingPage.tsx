import { useParams, useSearchParams, Link } from "react-router-dom";
import type { Movie } from "../types/Movie";

interface BookingPageProps {
  movies: Movie[];
}

const BookingPage = ({ movies }: BookingPageProps) => {
  const { slug } = useParams<{ slug: string }>(); // use slug instead of id
  const [searchParams] = useSearchParams();
  const showtime = searchParams.get("showtime");

  // find movie by slug instead of numeric ID
  const movie = movies.find((m) => m.slug === slug);

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
                  Selected Showtime: {showtime || "Not selected"}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            {/* Show Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Show Date
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Choose a date</option>
                {movie.showDates?.map((date, index) => (
                  <option key={index} value={date}>
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Tickets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Tickets
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { type: "Child", price: 8 },
                  { type: "Adult", price: 12 },
                  { type: "Senior", price: 9 },
                ].map(({ type, price }) => (
                  <div key={type}>
                    <label className="block text-sm text-gray-600 mb-1">
                      {type}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      defaultValue="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${price.toFixed(2)} each
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Seat Selection Placeholder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seat Selection
              </label>
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">🎭 Theater Screen</p>
                <div className="grid grid-cols-8 gap-2 max-w-md mx-auto">
                  {Array.from({ length: 32 }, (_, i) => (
                    <button
                      key={i}
                      className="w-8 h-8 bg-green-200 rounded border hover:bg-green-300 text-xs"
                      disabled
                    >
                      {String.fromCharCode(65 + Math.floor(i / 8))}
                      {(i % 8) + 1}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  🟢 Available • 🔴 Taken • 🟡 Selected
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  (Seat selection will be implemented in future sprints)
                </p>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Information
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Link
                to={`/movie/${movie.slug}`} // fixed: use slug
                className="flex-1 bg-gray-500 text-white text-center py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Movie Details
              </Link>
              <button
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
                disabled
              >
                Proceed to Checkout (Coming Soon)
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a prototype booking page for
              demonstration purposes. Seat selection, payment processing, and
              checkout functionality will be implemented in future sprints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;