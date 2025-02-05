import { useEffect, useState } from "react";
import img from './assets/Main-Logo.png';

const apiKey = "6add04ac";

export default function App() {
  const [movie, setMovie] = useState([]);
  const [search, setSearch] = useState("interstellar");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [watched, setWatched] = useState([]);

  const selected = (id) => {
    setSelectedMovie((prevSelected) => (prevSelected === id ? null : id));
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleDelete = (imdbID) => {
    setWatched((prevWatched) => prevWatched.filter((movie) => movie.imdbID !== imdbID));
  };


  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        setLoading(true);
        setError('');
        const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${search}`;
        
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await res.json();
        if (data.Response === 'False') {
          throw new Error(data.Error);
        }
        setMovie(data.Search);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (search.length <= 3) {
      setMovie([]);
      setError('');
      return;
    }
    fetchMovieDetails();
  }, [search]);

  function handleAddWatched(movie) {
    setWatched((prevWatched) => [...prevWatched, movie]);
  }

  return (
    <>
      <NavBar>
        <Search search={search} handleSearch={handleSearch} />
        <NumResults movies={movie} />
      </NavBar>

      <Main>
        <Box>
          {loading ? (
            <Loading />
          ) : error ? (
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', fontSize: '20px' }}>{error}</p>
          ) : movie.length <= 0 ? (
            <NotMovie />
          ) : (
            <MovieList movies={movie} selected={selected} />
          )}
        </Box>

        <Box>
          {selectedMovie ? (
            <MovieDetails selectedMovie={selectedMovie} selected={setSelectedMovie} handleAddWatched={handleAddWatched} />
          ) : (
            <>
              <WatchedSummary />
              <WatchedMoviesList watched={watched} handleDelete={handleDelete}/>
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loading() {
  return (
    <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', fontSize: '20px' }}>Loading...</h1>
  );
}

function NotMovie() {
  return (
    <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', fontSize: '20px' }}>No Movie Found</p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <img src={img} className="img" alt="Logo" />
    </div>
  );
}

function Search({ search, handleSearch }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      onChange={handleSearch}
      value={search}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, selected }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} selected={selected} />
      ))}
    </ul>
  );
}

function Movie({ movie, selected }) {
  return (
    <li onClick={() => selected(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedMovie, selected, handleAddWatched }) {
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const click = () => {
    selected(null); // Deselect the movie
  };

  const handleAdd = () => {
    if (movieDetails) {
      const newMovie = {
        imdbID:movieDetails.imdbID,
        title: movieDetails.Title,
        year: movieDetails.Year,
        poster: movieDetails.Poster,
      };
      handleAddWatched(newMovie);
    }
  };

  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${apiKey}&i=${selectedMovie}`
        );

        if (!res.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await res.json();
        setMovieDetails(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (selectedMovie) {
      fetchMovieDetails();
    }
  }, [selectedMovie]);

  if (loading) {
    return <p className="msg">Loading movie details...</p>;
  }

  if (error) {
    return <p className="msg">Error: {error}</p>;
  }

  if (!movieDetails) {
    return <p className="msg">No movie selected.</p>;
  }

  return (
    <div className="details">
      <h1 onClick={click}>&larr;</h1>
      <div className="details-overview">
        <h2>{movieDetails.Title}</h2>
        <img src={movieDetails.Poster} alt={`${movieDetails.Title} poster`} />
        <p>Year: {movieDetails.Year}</p>
        <p>Director: {movieDetails.Director}</p>
        <p>Actors: {movieDetails.Actors}</p>
        <p>Plot: {movieDetails.Plot}</p>
        <p>IMDb Rating: {movieDetails.imdbRating}⭐️</p>
        <button onClick={handleAdd} className="btn-add">Add to Watchlist</button>
      </div>
    </div>
  );
}

function WatchedSummary() {
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
    </div>
  );
}

function WatchedMoviesList({ watched,handleDelete }) {
  return (
    <ul className="list">
      {watched.map((movie, index) => (
        <WatchedMovie key={index} movie={movie} handleDelete={handleDelete} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie,handleDelete }) {
  return (
    <li className="watched-movie">
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <p>{movie.year}</p>
      <span onClick={() => handleDelete(movie.imdbID)}>❌</span>
    </li>
  );
}
