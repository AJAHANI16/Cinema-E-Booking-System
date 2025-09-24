import Navbar from "./components/Navbar"
const movies = [
  {
    id: 1,
    title: "Inception",
    genre: "Sci-Fi",
    poster: "https://via.placeholder.com/300x450",
  },
  {
    id: 2,
    title: "The Dark Knight",
    genre: "Action",
    poster: "https://via.placeholder.com/300x450",
  },
  {
    id: 3,
    title: "Interstellar",
    genre: "Sci-Fi",
    poster: "https://via.placeholder.com/300x450",
  },
  {
    id: 4,
    title: "Pulp Fiction",
    genre: "Drama",
    poster: "https://via.placeholder.com/300x450",
  },
]
function App() {
  return (
    <>
      <Navbar />
      <div className="p-4 min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Movies</h1>
          {/* Movie Card Example */}
          <div className="bg-grey-100 rounded-lg shadow-md overflow-hidden grid grid-cols-3 gap-6">
            {movies.map((movie) => (
              <div key={movie.id} className="p-4 bg-white rounded-lg shadow-md">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-64 object-cover mb-4 rounded"
                />
                <h2 className="text-xl font-semibold mb-2">{movie.title}</h2>
                <p className="text-gray-600 mb-4">{movie.genre}</p>
              </div>
            ))}
          </div>
        </div>
    </>
  )
}
export default App
