import React from 'react';

const StatCard = ({ label, value, icon: Icon, color = '#3b82f6', change, delay = 0 }) => {
    // Determine if Icon is a component (Lucide) or a pre-rendered element (FontAwesome string/element)
    const isLucideIcon = typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && !Icon.props);
    const renderIcon = () => {
        if (!Icon) return null;
        if (isLucideIcon) return <Icon size={20} strokeWidth={2.5} />;
        if (typeof Icon === 'string' && Icon.startsWith('<i')) {
            return <span dangerouslySetInnerHTML={{ __html: Icon }} />;
        }
        return Icon;
    };

    return (
        <div
            className="group relative glass-card p-4 flex flex-col gap-3 animate-slide-up hover:translate-y-[-2px] transition-all duration-300 overflow-hidden"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Hover Glow */}
            <div
                className="absolute -right-8 -top-8 w-24 h-24 blur-[40px] opacity-10 group-hover:opacity-30 transition-opacity"
                style={{ backgroundColor: color }}
            />

            <div className="flex items-center justify-between relative z-10">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform duration-300 shadow-lg"
                    style={{
                        backgroundColor: `${color}15`,
                        color: color,
                        boxShadow: `0 10px 20px -5px ${color}20`
                    }}
                >
                    {renderIcon()}
                </div>
                {change !== undefined && (
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">Trend</span>
                        <span className={`text-[11px] font-bold ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {change >= 0 ? '+' : ''}{change}%
                        </span>
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-3xl font-normal text-white italic tracking-tight mb-0.5" style={{ fontFamily: 'var(--font-serif)' }}>
                    {value ?? '0'}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                    {label}
                </p>
            </div>

            {/* Subtle Progress Bar or Accent */}
            <div className="w-full h-[1.5px] bg-white/5 relative mt-auto">
                <div
                    className="absolute left-0 top-0 h-full w-0 group-hover:w-full transition-all duration-1000"
                    style={{ backgroundColor: color, opacity: 0.5 }}
                />
            </div>
        </div>
    );
};

export default StatCard;
