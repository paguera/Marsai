import { Link } from "react-router-dom";

export interface EventItem {
  id: string | number;
  title: string;
  imageUrl?: string;
  start_at?: string;
  location?: string;
}

interface EventGridProps {
  events?: EventItem[];
  emptyMessage?: string;
}

function EventGrid({ events = [], emptyMessage }: EventGridProps) {
  const finalEmptyMessage = emptyMessage || "☠️ No event registered";

  return (
    <div className="w-full">
      {events.length > 1 ? (
        <div className="grid grid-cols-1 gap-8">
          {events.map((event) =>
            event.id !== 1 ? (
              <div
                key={event.id}
                className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-500 flex flex-col md:flex-row shadow-xl"
              >
                {/* Image Section */}
                <div className="w-full md:w-72 h-48 md:h-auto overflow-hidden">
                  <Link to={"/event/" + event.id} className="block h-full">
                    <img
                      src={event.imageUrl || "/avatar.webp"}
                      alt={event.title}
                      width="288"
                      height="192"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                  </Link>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center gap-4">
                  <div className="space-y-2">
                    <Link to={"/event/" + event.id}>
                      <h3 className="text-2xl md:text-3xl font-black text-white group-hover:text-primary transition-colors uppercase tracking-tighter">
                        {event.title}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap gap-4 text-sm font-medium text-white/40">
                      <span className="flex items-center gap-2">
                        📅{" "}
                        {event.start_at
                          ? new Date(event.start_at).toLocaleString()
                          : "Date à venir"}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-2">
                          📍 {event.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <Link
                      to={"/event/" + event.id}
                      className="px-6 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                    >
                      Réserver ma place
                    </Link>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-primary text-2xl">〓</span>
                </div>
              </div>
            ) : null,
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <p className="text-white/40 italic">{finalEmptyMessage}</p>
        </div>
      )}
    </div>
  );
}

export default EventGrid;
