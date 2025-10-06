interface ResultProps {
  id: number;
  score: number;
  snippet: string;
}

export default function Result({ id, score, snippet }: ResultProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Document #{id}
          </h3>
          <p className="text-slate-700 leading-relaxed">
            {snippet}
          </p>
        </div>
        <div className="ml-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Score: {score.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
}
