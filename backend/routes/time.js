export const timeAgo = (dateParam) => {
    if (!dateParam) return null;

    const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
    const today = new Date();
    const seconds = Math.round((today - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const isToday = today.toDateString() === date.toDateString();

    if (seconds < 5) return 'just now';
    else if (seconds < 60) return `${seconds}s ago`;
    else if (seconds < 90) return 'about a minute ago';
    else if (minutes < 60) return `${minutes}m ago`;
    else if (isToday) return `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
    else return date.toLocaleDateString(); // Fallback for older dates
};