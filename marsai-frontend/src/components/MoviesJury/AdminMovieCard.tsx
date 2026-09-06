import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Movie, MovieTag } from '../../types-interfaces/Movie';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getUploadUrl } from '../../utils/url';

interface AdminMovieCardProps {
    movie: Movie;
}

const AdminMovieCard: React.FC<AdminMovieCardProps> = ({ movie }) => {
    const { t } = useTranslation(['common', 'Galery', 'Dashboard']);
    const { token } = useAuth();
    const [tags, setTags] = useState<MovieTag[]>([]);
    const [currentStatus, setCurrentStatus] = useState(movie.status);
    const [isLoading, setIsLoading] = useState(false);
    const baseUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch(`${baseUrl}/movies/${movie.id}/tags`);
                if (response.ok) {
                    const data = await response.json();
                    setTags(data);
                }
            } catch (err) {
                console.error("Error fetching tags:", err);
            }
        };
        fetchTags();
    }, [movie.id, baseUrl]);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setIsLoading(true);
        try {
            const response = await fetch(
                `${baseUrl}/admin/movie-status/${movie.id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status: newStatus }),
                },
            );

            if (response.ok) {
                setCurrentStatus(newStatus as any);
            } else {
                console.error("Erreur lors de la mise à jour");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full hover:border-primary/30 transition-all duration-300">
            <div className="relative group">
                <Link to={`/movies/${movie.id}`} className="block">
                    <div className="h-48 overflow-hidden">
                        {movie.cover_image ? (
                            <img
                                src={getUploadUrl(movie.cover_image)}
                                alt={movie.english_title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-white/30 italic">
                                {t('movies_thumbnails.image_placeholder')}
                            </div>
                        )}
                    </div>
                </Link>
            </div>

            <div className="p-5 flex flex-col flex-1 gap-4">
                <div>
                    <Link to={`/movies/${movie.id}`}>
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 hover:text-primary transition-colors">
                            {movie.english_title}
                        </h3>
                    </Link>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                        {tags.slice(0, 3).map(tag => (
                            <span key={tag.id} className="text-[10px] text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor={`status-${movie.id}`} className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                            Statut du film
                        </label>
                        <select
                            id={`status-${movie.id}`}
                            className={`w-full bg-dark/50 border border-white/10 text-white p-2 rounded-xl focus:outline-none focus:border-primary transition-all cursor-pointer text-sm font-medium ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                            onChange={handleStatusChange}
                            value={currentStatus}
                        >
                            <option value="Accepted">{t("status.accepted", { ns: "common" })}</option>
                            <option value="Rejected">{t("status.rejected", { ns: "common" })}</option>
                            <option value="Pending">{t("status.pending", { ns: "common" })}</option>
                        </select>
                    </div>

                    <Link 
                        to={`/movies/${movie.id}`}
                        className="w-full inline-block text-center py-2 bg-white/5 border border-white/10 text-white/70 rounded-xl text-xs hover:bg-white/10 transition-all"
                    >
                        Détails complets
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminMovieCard;