import { useState, useEffect } from 'react';

const apiKey = "6add04ac";

export function useMovieBySearch(search) {
    const [movie, setMovie] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
    return { movie, error, loading };
}

export function useMovieById(selectedMovie){
    const [movieDetails, setMovieDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
    
        fetchMovieDetails();
      }, [selectedMovie]);

      return {movieDetails,loading,error}
}