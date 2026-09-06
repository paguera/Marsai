import type { MovieTag } from '../types-interfaces/Movie';

function Tags(props: { tags: MovieTag[] | any[] | null, selected: MovieTag | null, onTagSelect: (t: MovieTag | null) => void }) {
    const { tags, selected, onTagSelect } = props;

    const handleTagClick = (t: any) => {
        if (selected && selected.id === t.id) {
            onTagSelect(null);
        } else {
            onTagSelect(t);
        }
    }
    if (!tags || tags.length === 0) return <div className="text-white/50 italic text-center">Aucun tag disponible pour cette section</div>


    return (
        <div className="my-6">
            {/* TAGS */}
            <div className="flex flex-wrap gap-3 text-white justify-center">
                {tags.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => handleTagClick(t)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                            selected && selected.id === t.id 
                            ? "bg-brand border-brand text-white shadow-lg shadow-brand/20" 
                            : "bg-white/5 border-white/10 hover:border-white/30 text-white/70"
                        }`}
                    >
                        # {t.tag_name || t.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Tags;



