import { useEffect, useState } from 'react';
import type Newsletter from '../../../types-interfaces/Newsletter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';

function NewsletterSend() {

    const { t } = useTranslation('Dashboard');
    const { token } = useAuth();

    // Initalise le composant select avec les newsletters enregistrées en DB
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [selectedValue, setSelectedValue] = useState<string>('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        async function fetchNewsletters() {
            try {
                const response = await fetch(import.meta.env.VITE_API_URL + `/newsletters`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) throw new Error("Erreur de réponse réseau");
                const result = await response.json();
                setNewsletters(result.data || []);
                
                // Positionne l'état par défaut sur le premier élément de la liste chargée
                if (result.data && result.data.length > 0) {
                    setSelectedValue(result.data[0].id.toString());
                }
            } catch (error) {
                console.error("Erreur de chargement des newsletters :", error);
            }
        }
        fetchNewsletters();
    }, [token]);

    // Récupère la newsletter sélectionnée parmi les newsletters
    // Envoie une demande au back pour envoyer les emails.
    async function sendNewsletterById(id: string) {
        if (!id) {
            alert("Aucune newsletter sélectionnée.");
            return;
        }
        
        setIsSending(true);
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + `/newsletters/send`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newsletterId: id })
            });
            
            if (!response.ok) {
                throw new Error("Le serveur a retourné une erreur");
            }
            
            alert("La newsletter a été envoyée avec succès à tous les abonnés !");
        }
        catch (err: any) {
            console.error("Erreur lors de l'envoi de la newsletter :", err);
            alert("Une erreur est survenue lors de l'envoi : " + err.message);
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="w-full bg-primary rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-8">
            <h2 className="text-sm sm:text-xl font-bold text-black whitespace-normal md:whitespace-nowrap text-center md:text-left">
                {t("newsletters.send_to_subscribers")}
            </h2>
            
            <div className='flex flex-row items-center gap-2 sm:gap-4 w-full md:w-auto'>
                <select 
                    value={selectedValue}
                    onChange={(e) => setSelectedValue(e.currentTarget.value)} 
                    name="newsletterList" 
                    id="newsletterList" 
                    className='flex-1 md:flex-none bg-black/10 text-black border-2 border-black/20 p-1.5 sm:p-2 text-xs sm:text-sm rounded-lg outline-none focus:border-black transition-all font-semibold'
                >
                    {newsletters.length > 0 ? newsletters.map((nl) => (
                        <option key={nl.id} value={nl.id}>{nl.object}</option>
                    )) : (
                        <option value="">Aucune newsletter enregistrée</option>
                    )}
                </select>
                
                <button 
                    disabled={isSending || newsletters.length === 0}
                    className='bg-black text-white px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm rounded-lg font-bold hover:bg-gray-800 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed' 
                    onClick={() => sendNewsletterById(selectedValue)}
                >
                    <svg className="w-4 h-4 sm:w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    {isSending ? "Envoi en cours..." : t("newsletters.send_button")}
                </button>
            </div >
        </div>
    );
}
export default NewsletterSend
