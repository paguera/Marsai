interface StatCardProps {
  icon: string;
  title: string;
  objective: string | number;
  objectivemax: string | number;
  percentageText?: string;
  progressValue?: string | number;
  children?: any;
}

export default function StatCard({
  icon,
  title,
  objective,
  objectivemax,
  percentageText,
  progressValue,
  children,
}: StatCardProps) {
  return (
    <div className="border border-white rounded-md p-6 flex flex-col justify-between cursor-pointer">
      <div className="flex pb-2 text-6xl justify-center items-center">
        {icon}
        <p className="bg-secondary/50 text-black font-bold text-sm ml-auto  p-7 rounded-full">
          {objective + "/" + objectivemax}
        </p>
      </div>
      <div>
        <p className="font-semibold text-white text-lg">{title}</p>
      </div>
      <div className="mt-6 text-white">
        {/* POUR LES CARDS FULL W */}
        {progressValue !== undefined ? (
          <>
            <p className="font-light">{percentageText}</p>
            <progress
              max="100"
              className="w-full h-4 appearance-none overflow-hidden rounded-full 
              bg-white 
              [&::-webkit-progress-bar]:bg-slate-200 
              [&::-webkit-progress-value]:bg-secondary 
              [&::-moz-progress-bar]:bg-secondary"
              value={progressValue}
            />
          </>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
