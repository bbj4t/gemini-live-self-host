import React, { useRef, useEffect } from 'react';
import { TranscriptTurn } from '../types';

interface TranscriptViewProps {
  history: TranscriptTurn[];
  currentTurn: { user: string; model: string };
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({ history, currentTurn }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentTurn]);

  return (
    <div ref={scrollRef} className="flex-grow w-full max-w-4xl p-6 mb-4 bg-gray-800 bg-opacity-50 rounded-lg overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      {history.map((turn) => (
        <React.Fragment key={turn.id}>
          {turn.user && (
             <div className="flex justify-end">
                <p className="bg-blue-600 text-white p-3 rounded-lg max-w-prose">{turn.user}</p>
             </div>
          )}
          {turn.model && (
            <div className="flex justify-start">
                <p className="bg-gray-700 text-gray-200 p-3 rounded-lg max-w-prose">{turn.model}</p>
            </div>
          )}
        </React.Fragment>
      ))}
      {/* Current, streaming turn */}
      {currentTurn.user && (
         <div className="flex justify-end">
            <p className="bg-blue-600 text-white p-3 rounded-lg max-w-prose opacity-75">{currentTurn.user}</p>
         </div>
      )}
      {currentTurn.model && (
         <div className="flex justify-start">
            <p className="bg-gray-700 text-gray-200 p-3 rounded-lg max-w-prose opacity-75">{currentTurn.model}</p>
         </div>
      )}
    </div>
  );
};
