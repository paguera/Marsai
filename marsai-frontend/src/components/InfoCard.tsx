import type { InfoCardProps } from "../types-interfaces/Common";

export default function InfoCard(card: InfoCardProps) {
  return (
    <>
      <div className="flex flex-col w-64 h-64 aspect-square border border-white/10 shadow-xl bg-gradient-to-br from-white/5 to-white/20 backdrop-blur-xl rounded-[32px] justify-center items-center text-center p-6 hover:scale-105 transition-transform duration-300 group">
        <span className="text-5xl mb-4 group-hover:scale-110 transition-transform ">
          {card.icon}
        </span>
        <span className="font-bold text-white text-xl mb-2 uppercase tracking-tight">
          {card.title}
        </span>
        <span className="text-white/60 text-sm leading-snug">{card.desc}</span>
      </div>
    </>
  );
}
