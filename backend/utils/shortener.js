/**
 * Shortens a URL using TinyURL's free API.
 * @param {string} longUrl - The URL to shorten.
 * @returns {Promise<string>} - The shortened URL or the original if failed.
 */
const shortenUrl = async (longUrl) => {
    try {
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        if (response.ok) {
            return await response.text();
        }
        return longUrl; // Fallback to original
    } catch (error) {
        console.error('URL Shortening failed:', error.message);
        return longUrl; // Fallback
    }
};

module.exports = { shortenUrl };