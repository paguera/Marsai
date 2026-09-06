import React, { useEffect, useState } from 'react';
import type { Movie, MovieTag } from '../../types-interfaces/Movie';
import { useTranslation } from 'react-i18next';
import JuryMovieCard from './JuryMovieCard';
import AdminMovieCard from './AdminMovieCard';
import { useAuth } from '../../context/AuthContext';

interface MoviesListProps {
    section: 'Accepted' | 'best' | 'Pending' | 'Rejected';
    variant?: 'jury' | 'public' | 'admin';
    type: 'full ai' | 'hybrid' | 'all';
    search: string;
    selected: MovieTag | null;
}

const MoviesList: React.FC<MoviesListProps> = ({ section, variant = 'jury', type='all', search = '', selected=null}) => {
    const { t } = useTranslation(['Festival', 'common', 'Galery']);
    const { token } = useAuth();

    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [moviesPerPage, setMoviesPerPage] = useState<number>(8);


    

    // Fetch movies
    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            setError(null);
            
            let categoryParam = '';
            if (section === 'best') categoryParam = 'category=best';
            else if (section === 'Accepted') categoryParam = 'category=selection';
            else if (section === 'Pending') categoryParam = 'category=pending';
            else if (section === 'Rejected') categoryParam = 'category=rejected';
            
            let typeParam = '';
            if (type === 'hybrid') typeParam = 'type=hybrid';
            else if (type === 'full ai') typeParam = 'type=fullAI';
            else if (type === 'all') typeParam = '';

            let url = `${import.meta.env.VITE_API_URL}/movies?limit=${moviesPerPage}&page=${currentPage}`;
            if (categoryParam) url += `&${categoryParam}`;
            if (typeParam) url += `&${typeParam}`;
            if (selected && selected.id !== 0) url += `&tag=${selected.id}`;

            try {
                const headers: any = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(url, { headers });
                if (!response.ok) {
                    if (response.status === 401) throw new Error("Non autorisé. Veuillez vous reconnecter.");
                    throw new Error("Failed to fetch movies");
                }
                const data = await response.json();
                setMovies(data);
                

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [section, selected, type, currentPage, moviesPerPage, token]);

    if (loading && movies.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-white text-xl animate-pulse">{t('loading.generic', { ns: 'common' })}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-10 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400">
                {t('errors.generic', { ns: 'common' })}: {error}
            </div>
        );
    }

    const filteredMovies = movies.filter(movie => 
        (movie.english_title || '').toLowerCase().includes(search.toLowerCase()) ||
        (movie.english_synopsis || '').toLowerCase().includes(search.toLowerCase()) ||
        (movie.original_title || '').toLowerCase().includes(search.toLowerCase()) ||
        (movie.original_synopsis || '').toLowerCase().includes(search.toLowerCase())
    );

    const renderCard = (movie: Movie) => {
        if (variant === 'admin') {
            return <AdminMovieCard key={movie.id} movie={movie} />;
        }
        return <JuryMovieCard key={movie.id} movie={movie} showRating={variant === 'jury'} />;
    };

    return (
        <div className="flex flex-col gap-8">
            
            {/* Movie Grid */}
            {filteredMovies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMovies.map(movie => renderCard(movie))}
                </div>
            ) : (
                <div className="text-center py-20 text-white/40 italic border-2 border-dashed border-white/5 rounded-3xl">
                    Aucun film trouvé
                </div>
            )}

            {/* Pagination (only for non-best section if we want simple view) */}
            {section !== 'best' && (
                <div className="flex flex-col items-center gap-4 mt-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-6 py-2 border border-white/10 text-white rounded-xl disabled:opacity-30 hover:bg-brand transition-colors"
                        >
                            {t('pagination.previous', { ns: 'common' })}
                        </button>
                        <span className="text-white font-medium">
                            {t('pagination.page', { ns: 'common', count: currentPage })}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={movies.length < moviesPerPage}
                            className="px-6 py-2 border border-white/10 text-white rounded-xl disabled:opacity-30 hover:bg-brand transition-colors"
                        >
                            {t('pagination.next', { ns: 'common' })}
                        </button>
                    </div>
                    
                    <select 
                        value={moviesPerPage} 
                        onChange={(e) => { setMoviesPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
                        className="border border-white/10 text-white p-2 rounded-xl focus:outline-none"
                    >
                        {[4, 8, 12, 16, 20].map(val => (
                            <option key={val} value={val}>{t('pagination.results_per_page', { count: val, ns: 'common' })}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default MoviesList;