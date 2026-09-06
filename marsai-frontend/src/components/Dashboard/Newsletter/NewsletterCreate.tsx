import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TipTap from './TipTap';
import { useAuth } from '../../../context/AuthContext';

const NewsletterCreate = () => {
    // Récupération du contexte de traduction pour l'interface utilisateur
    const { t } = useTranslation("Dashboard");
    // Récupération du jeton d'authentification depuis le contexte global pour les requêtes API
    const { token } = useAuth();

    // Initialisation d'une référence pour le composant TipTap (éditeur de texte).
    // Utilisation d'une interface définissant la méthode nécessaire : getHTML()
    const editorRef = useRef<{ getHTML: () => string } | null>(null);
    // État local pour stocker l'objet (sujet) de la newsletter
    const [object, setObject] = useState<string>('');
    const [isOpen, setIsOpen] = useState(true);

    // Gestionnaire de changement de champ pour l'objet de la newsletter
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setObject(e.target.value);
    }

    // Gestionnaire de soumission du formulaire
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // Validation simple
        if (!object.trim()) {
            alert("L'objet de la newsletter est requis.");
            return;
        }

        // Vérifie si l'éditeur est initialisé avant de tenter d'extraire son contenu
        if (editorRef && editorRef.current) {
            const htmlContent = editorRef.current?.getHTML();
            
            // Validation du contenu (TipTap renvoie <p></p> quand c'est vide)
            if (!htmlContent || htmlContent === '<p></p>') {
                alert("Le contenu de la newsletter ne peut pas être vide.");
                return;
            }

            try {
                // Construction de l'URL de l'endpoint API avec la variable d'environnement
                const response = await fetch(import.meta.env.VITE_API_URL + `/newsletters`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`, // Inclusion du jeton Bearer pour l'authentification
                        'Content-Type': 'application/json', // Définition du type de contenu JSON
                    },
                    // Envoi des données : l'objet et le contenu HTML de l'éditeur
                    body: JSON.stringify({ object: object, content: htmlContent }),
                });

                if (response.ok) {
                    // Affichage d'un message de succès en utilisant les traductions
                    alert(t('newsletter.success_message'));
                    setObject('');
                    // Une réinitialisation de l'éditeur TipTap serait idéale ici
                } else if (response.status === 409) {
                    // Gestion spécifique d'une erreur de conflit (probablement duplication)
                    alert(t('newsletter.error_message_conflict'));
                }
            } catch (error) {
                console.error('There is a problem with your fetch operation:', error);
            }
        } else {
            console.error('Editor ref is not properly initialized');
        }
    };

    // Rendu conditionnel en cas d'erreur d'initialisation (optionnel, mais bon pour la sécurité)
    if (!editorRef) return <div>{t('errors.generic', { ns: 'common' })}</div>;

    return (
        <div className="flex flex-col gap-6">
            <div 
                className="w-auto p-3 sm:p-4 bg-primary rounded-xl flex items-center justify-between px-4 sm:px-8 cursor-pointer hover:bg-opacity-90 transition-all group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`text-sm sm:text-xl transition-transform duration-500 ease-in-out transform ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
                        ▶
                    </span>
                    <h2 className="text-sm sm:text-2xl font-bold text-black">{t('newsletters.create_title')}</h2>
                </div>
                {/* Bouton de soumission dans la barre de titre */}
                <button 
                    className="bg-black text-white px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold hover:bg-gray-800 transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap" 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSubmit(e);
                    }} 
                    type="submit"
                >
                    <svg className="w-4 h-4 sm:w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    {t('newsletters.save_button')}
                </button>
            </div>

            {/* Formulaire principal */}
            <div className={`transition-all duration-750 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-900/40 p-6 rounded-xl border border-gray-800 space-y-6">
                    <div className='flex flex-col md:flex-row gap-4 items-center'>
                        <label htmlFor="object" className='text-lg font-semibold text-white min-w-[100px]'>{t('newsletters.object_label')}</label>
                        <input
                            onChange={(e) => handleChange(e)}
                            name="object"
                            id="object"
                            type="text"
                            placeholder="Ex: Newsletter de Mars 2026"
                            className='flex-1 bg-gray-800 text-white focus:outline-none border border-gray-700 focus:border-primary rounded-lg p-3 transition-all'
                        />
                    </div>

                    {/* Zone d'édition */}
                    <div className="editor bg-gray-800/20 rounded-lg">
                        <TipTap ref={editorRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewsletterCreate;