import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

interface MovieRatingProps {
    movieId: number;
    initialNote?: number;
    initialComment?: string;
}

const MovieRating: React.FC<MovieRatingProps> = ({ movieId, initialNote = 5, initialComment = '' }) => {
    const { t } = useTranslation(['Galery', 'common']);
    const { user, token } = useAuth();
    const [note, setNote] = useState<number>(initialNote);
    const [comment, setComment] = useState<string>(initialComment);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [existingRating, setExistingRating] = useState<any>(null);

    useEffect(() => {
        const checkExistingRating = async () => {
            if (!user || !token) return;
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/movies/${movieId}/ratings`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (response.ok) {
                    const ratings = await response.json();
                    const userRating = ratings.find((r: any) => parseInt(r.user_id.toString()) === parseInt(user.id.toString()));
                    if (userRating) {
                        setExistingRating(userRating);
                    }
                }
            } catch (error) {
                console.error("Erreur lors de la vérification de la note :", error);
            }
        };
        checkExistingRating();
    }, [movieId, user, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !token || user.role !== 'JURY') return;

        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/movies/${movieId}/ratings`,
                {
                    method: "POST",
                    body: JSON.stringify({ 
                        note: note, 
                        comment: comment, 
                        user_id: user.id, 
                        movie_id: movieId 
                    }),
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );
            if (response.ok) {
                setSuccess(true);
                setExistingRating({ note, comment, user_id: user.id });
                setTimeout(() => setSuccess(false), 3000);
            } else {
                const data = await response.json();
                setErrorMessage(data.error || "Échec de l'ajout de note");
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de note :", error);
            setErrorMessage("Erreur lors de la soumission");
        } finally {
            setIsLoading(false);
        }
    };

    if (existingRating) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-white flex flex-col gap-1.5 backdrop-blur-md">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-white/70">Votre évaluation</span>
                    <span className="text-lg font-black text-green-400">{existingRating.note} / 10</span>
                </div>
                {existingRating.comment && (
                    <p className="text-xs text-white/50 italic leading-relaxed">
                        "{existingRating.comment}"
                    </p>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col gap-3">
            {errorMessage && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                    {errorMessage}
                </div>
            )}
            <div className="flex flex-col">
                <label htmlFor={`comment-${movieId}`} className="text-sm font-medium text-white/80 mb-1">
                    {t("movie_details.apprecied", { ns: 'Galery' })}
                </label>
                <textarea
                    id={`comment-${movieId}`}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t("movie_details.comment_placeholder", { ns: 'Galery' })}
                    className="bg-brand2/30 border border-white/20 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary transition-colors h-20 resize-none"
                />
            </div>

            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white/80">Note</span>
                    <span className="text-lg font-bold text-primary">{note} / 10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={note}
                    onChange={(e) => setNote(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className={`mt-2 py-2 rounded-lg font-bold transition-all ${
                    success 
                    ? 'bg-green-500 text-white' 
                    : 'bg-primary text-black hover:bg-primary/80 disabled:opacity-50'
                }`}
            >
                {isLoading ? t("loading.generic", { ns: 'common' }) : success ? "✓" : t("movie_details.add_rating_button", { ns: 'Galery' })}
            </button>
        </form>
    );
};

export default MovieRating;