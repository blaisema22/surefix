import React from 'react';
import { MapPin } from 'lucide-react';

const AddressList = ({ centers, activeCentreId, onCenterClick }) => {
  if (!centers || centers.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center glass border border-white/5 rounded-2xl p-8 text-center">
        <MapPin size={48} className="text-slate-500 mb-4 opacity-50" />
        <p className="text-slate-400 text-sm">No centres available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col glass border border-white/5 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <h3 className="font-bold text-lg text-white flex items-center gap-2">
          <MapPin size={20} />
          Repair Centres ({centers.length})
        </h3>
        <p className="text-xs text-slate-400 mt-1">Addresses from our network - fetched from backend</p>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {centers.map((c) => {
          const isActive = c.centre_id === activeCentreId;
          return (
            <div
              key={c.centre_id}
              className={`p-4 rounded-xl transition-all duration-200 cursor-pointer group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/50 shadow-2xl shadow-blue-500/25 translate-y-[-4px]'
                  : 'glass hover:glass hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 border border-transparent'
              }`}
              onClick={() => onCenterClick?.(c)}
            >
              {/* Centre header */}
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-bold text-white text-base ${isActive ? 'text-blue-300 drop-shadow-lg' : ''}`}>
                  {c.name}
                </h4>
                {c.district && (
                  <span className="px-3 py-1 bg-slate-800/50 text-xs text-slate-300 rounded-full border border-slate-700/50">
                    {c.district}
                  </span>
                )}
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 mb-3 group-hover:translate-x-1 transition-transform">
                <MapPin size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <p className={`text-sm leading-relaxed ${isActive ? 'text-slate-200 font-medium' : 'text-slate-300'}`}>
                  {c.address}
                </p>
              </div>

              {/* Coords if available */}
              {c.latitude && c.longitude && (
                <div className={`text-xs text-slate-500 bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-800/50 ${isActive ? 'bg-blue-900/30 border-blue-500/30' : ''}`}>
                  📍 {parseFloat(c.latitude).toFixed(4)}, {parseFloat(c.longitude).toFixed(4)}
                </div>
              )}

              {/* Phone if available */}
              {c.phone && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className={`text-xs ${isActive ? 'text-blue-300' : 'text-slate-400'}`}>
                    📞 {c.phone}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(AddressList);

