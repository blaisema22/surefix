import React from 'react';

const LoadingSpinner = ({ size = 40, message = null }) => {
    return (
        <div className="flex flex-col justify-center items-center p-5 gap-4">
            <div
                className="border-4 rounded-full animate-spin border-blue-500/30 border-t-blue-500 dark:border-sf-blue/30 dark:border-t-sf-blue"
                style={{ width: size, height: size }}
            ></div>
            {message && (
                <p className="text-gray-500 dark:text-sf-text-muted">{message}</p>
            )}
        </div>
    );
};

export default LoadingSpinner;