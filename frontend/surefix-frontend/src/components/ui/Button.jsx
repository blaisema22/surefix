import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
    disabled,
    loading,
    onClick,
    type = 'button',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

    const variants = {
        primary: 'btn-primary bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:ring-blue-500',
        secondary: 'btn-secondary bg-surface border border-border hover:bg-surface-hover text-text-2 focus-visible:ring-blue-400',
        danger: 'bg-red-500 hover:bg-red-600 text-white focus-visible:ring-red-500'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            type={type}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : icon ? (
                React.cloneElement(icon, { size: size === 'sm' ? 14 : 16 })
            ) : null}
            {children}
        </button>
    );
};

export default Button;

