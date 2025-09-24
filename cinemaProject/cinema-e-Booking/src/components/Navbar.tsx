const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4 flex items-center justify-between">

      <a href="#" className="text-white font-bold text-lg hover:text-gray-300">
        Cinema E-Booking
      </a>

      <div className="flex flex-1 mx-4 gap-2">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-3 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select className="ml-2 px-3 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Genres</option>
          <option value="action">Action</option>
          <option value="comedy">Comedy</option>
          <option value="drama">Drama</option>
          <option value="horror">Horror</option>
          <option value="sci-fi">Sci-Fi</option>
        </select>
      </div>

      <div className="space-x-4">
        <a href="#" className="text-white hover:text-gray-300">Home</a>
        <a href="#" className="text-white hover:text-gray-300">About</a>
        <a href="#" className="text-white hover:text-gray-300">Contact</a>
      </div>
    </nav>
  );
};

export default Navbar;
