// typescript interfaces for our movie data
// this makes sure we dont make mistakes with missing properties or wrong data types

// main movie interface - every movie object has to have all these properties
export interface Movie {
  id: number; // unique number for each movie
  title: string; // the movies title 
  genre: string; // what type of movie (action, comedy, horror etc)
  rating: string; // age rating like G, PG, PG-13, R - tells you if kids can watch
  description: string; // short summary of what the movie is about
  synopsis: string; // longer description with more plot details
  cast: string[]; // list of famous actors in the movie
  director: string; // person who directed it
  producer: string; // person who produced/funded it
  poster: string; // image URL for movie poster
  trailerUrl: string; // youtube video link for trailer preview
  showtimes: string[]; // times when movie plays like "2:00 PM", "5:30 PM"
  category: 'currently-running' | 'coming-soon'; // whether its in theaters now or comming soon
  showDates: string[]; // what dates you can watch it
  reviews: string; // review summary or rating info
}

// booking interface - when someone reserves tickets this is the info we need
export interface BookingInfo {
  movieId: number; // which movie there booking tickets for
  movieTitle: string; // movie name (easier than looking it up every time)
  showtime: string; // what time there seeing it
  showDate: string; // what day there going to watch
}