import { useEffect, useRef, useState } from "react";
import img from './assets/Main-Logo.png';
import { useMovieBySearch } from "./useMovie";
import { useMovieById } from "./useMovie";

//const apiKey = "6add04ac";

export default function App() {
  const [search, setSearch] = useState("interstellar");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [watched, setWatched] = useState(
    () => JSON.parse(localStorage.getItem('watched')) || []
  );

  useEffect(()=>{
    localStorage.setItem('watched',JSON.stringify(watched));
  },[watched]);

  const { movie, error, loading } = useMovieBySearch(search);

  const selected = (id) => {
    setSelectedMovie((prevSelected) => (prevSelected === id ? null : id));
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleDelete = (imdbID) => {
    setWatched((prevWatched) => prevWatched.filter((movie) => movie.imdbID !== imdbID));
  }

  function handleDeleteAll() {
    setWatched([]);
   }

  function handleAddWatched(movie) {
    setWatched((prevWatched) => [...prevWatched, movie]);
    setSelectedMovie(null)
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
              <WatchedSummary watched={watched}/>
              <WatchedMoviesList watched={watched} handleDelete={handleDelete} handleDeleteAll={handleDeleteAll}/>
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
  const inputRef = useRef(null);
  
  useEffect(() => {
    inputRef.current.focus();
  },[]);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      onChange={handleSearch}
      value={search}
      ref={inputRef}
    />
  );
}

function NumResults({ movies }) {
  
  return (
    <p className="num-results" >
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

  const {movieDetails,loading,error} = useMovieById(selectedMovie);
  
  const click = () => {
    selected(null); // Deselect the movie
  };

  const handleAdd = () => {
      const newMovie = {
        imdbID:movieDetails.imdbID,
        title: movieDetails.Title,
        year: movieDetails.Year,
        poster: movieDetails.Poster,
      };
      handleAddWatched(newMovie);
  };

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

function WatchedSummary({watched}) {

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      {watched?.length>0 ? <h3 >Watched : <strong style={{fontSize:'15px'}}>{watched.length}</strong></h3> : <h4 style={{color:'red'}}>No Movies Added To Watchlist</h4>}
    </div>
  );
}

function WatchedMoviesList({ watched,handleDelete,handleDeleteAll }) {
  return (
    <>
    <ul className="list">
      {watched?.map((movie, index) => (
        <WatchedMovie key={index} movie={movie} handleDelete={handleDelete} />
      ))}
    </ul>
    {watched?.length > 0 && <button onClick={handleDeleteAll} className="btn-add" style={{marginLeft:'2em'}}>Remove All</button>}
    </>
  );
}

function WatchedMovie({ movie,handleDelete }) {
  return (
    <>
    <li className="watched-movie">
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <p>{movie.year}</p>
      <span onClick={() => handleDelete(movie.imdbID)}>❌</span>
    </li>
    </>
  );
}
