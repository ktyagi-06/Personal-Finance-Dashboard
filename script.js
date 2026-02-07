// script.js

// IMPORTANT: Replace 'YOUR_NEWS_API_KEY' with an actual key from a News API provider (e.g., NewsAPI, GNews, MediaStack).
const NEWS_API_KEY = 6854a2ac195e4e11894e31e3ee9b6a4c; 
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines'; 

const newsContainer = document.getElementById('local-news-container');
const locationDisplay = document.getElementById('location-display');
const loadingMessage = document.getElementById('loading-message');

// --- Core Application Logic ---

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    initializeLocation();
});

/**
 * 1. Get User Location using Geolocation API
 */
function initializeLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                // Once location is retrieved, fetch the news based on coordinates
                fetchLocalNews(lat, lon);
            },
            (error) => {
                console.error("Geolocation Error:", error);
                locationDisplay.innerHTML = '🌍 **Location Blocked/Failed**. Showing Global News.';
                // Fallback: Fetch general/global news if location is denied or fails
                fetchGeneralNews();
            }
        );
    } else {
        locationDisplay.innerHTML = '🌍 **Global News**. (Geolocation not supported)';
        fetchGeneralNews();
    }
}

/**
 * 2. Fetch News based on Location (Conceptual)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
async function fetchLocalNews(lat, lon) {
    // 1. Show Loading State
    newsContainer.innerHTML = '<div id="loading-message"><div class="loading-spinner"></div>Fetching news for your location...</div>';

    try {
        // *** REAL-WORLD REQUIREMENT: REVERSE GEOCODING ***
        // News APIs typically use country codes (e.g., 'us', 'in', 'gb').
        // You would need a **Reverse Geocoding API** here to convert lat/lon into a country code.
        // For demonstration, we'll use a placeholder country (e.g., 'in' for India) or a country derived from a proxy API.
        
        // Simulating reverse geocoding to get a country code:
        // You would replace this with a real API call to get the user's country code.
        const countryCode = 'in'; // Example: Hardcoded country code for testing
        locationDisplay.innerHTML = `📍 **${countryCode.toUpperCase()}** (Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)})`;

        // 2. Fetch Headlines from a News API using the country code
        const url = `${NEWS_API_URL}?country=${countryCode}&apiKey=${NEWS_API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`News API status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
        } else {
            newsContainer.innerHTML = '<p id="loading-message">No local news found for your area. Try a general search.</p>';
        }

    } catch (error) {
        console.error('Error fetching local news:', error);
        newsContainer.innerHTML = '<p id="loading-message">Error fetching news. Please check your **API Key** and network. Showing general headlines as fallback.</p>';
        fetchGeneralNews();
    }
}

/**
 * Fallback function for general news
 */
async function fetchGeneralNews() {
    try {
        // Fetch top general headlines (e.g., from the 'general' category or without a country filter)
        const url = `${NEWS_API_URL}?category=general&pageSize=6&apiKey=${NEWS_API_KEY}`; 
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
        } else {
            newsContainer.innerHTML = '<p id="loading-message">Could not load any news articles.</p>';
        }
    } catch (error) {
        console.error('Error fetching general news:', error);
        newsContainer.innerHTML = '<p id="loading-message">An unknown error occurred while trying to fetch news.</p>';
    }
}

/**
 * 3. Display News Articles (Updated for real API data structure)
 */
function displayNews(articles) {
    newsContainer.innerHTML = ''; // Clear loading message

    articles.slice(0, 6).forEach((article, index) => { // Limit to 6 articles
        const card = document.createElement('div');
        card.className = 'news-card';

        // Clean up title/description and use placeholders for missing fields
        const title = article.title || 'Untitled Article';
        const description = article.description || 'Click to read more about this top story.';
        const sourceName = article.source.name || 'Unknown Source';
        const imageUrl = article.urlToImage || 'https://via.placeholder.com/400x220?text=News+Image'; 
        const articleUrl = article.url || '#';
        const category = getCategoryFromTitle(title); // Estimate category

        card.innerHTML = `
            <div class="news-image">
                <img src="${imageUrl}" alt="${title}">
            </div>
            <div class="news-content">
                <div class="news-meta">
                    <span class="news-category">${category.toUpperCase()}</span>
                    <span class="news-time"><i class="far fa-clock"></i> ${timeSince(new Date(article.publishedAt))}</span>
                </div>
                <h3>${title}</h3>
                <p>${description.substring(0, 100)}...</p>
                <div class="news-actions">
                    <a href="${articleUrl}" target="_blank" class="read-more">
                        Read More <i class="fas fa-arrow-right"></i>
                    </a>
                    <div class="news-interactions">
                        <span style="font-size:0.9em; color:#718096;"><i class="fas fa-share-alt"></i> ${sourceName}</span>
                    </div>
                </div>
            </div>
        `;
        newsContainer.appendChild(card);
    });
}

// --- Helper Functions ---

function getCategoryFromTitle(title) {
    title = title.toLowerCase();
    if (title.includes('sports') || title.includes('match') || title.includes('team')) return 'sports';
    if (title.includes('stock') || title.includes('business') || title.includes('market')) return 'business';
    if (title.includes('tech') || title.includes('ai') || title.includes('startup')) return 'tech';
    if (title.includes('alert') || title.includes('breaking')) return 'breaking';
    return 'local'; // Default to local
}

function timeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

function setupEventListeners() {
    // Existing event listeners (Search, Tabs, Trending) are preserved
    
    // Search functionality
    document.getElementById('search-button').addEventListener('click', performSearch);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterNews(this.dataset.category);
        });
    });

    // Trending items
    document.querySelectorAll('.trending-item').forEach(item => {
        item.addEventListener('click', function() {
            document.getElementById('search-input').value = this.dataset.term;
            performSearch();
        });
    });
}

function performSearch() {
    const searchTerm = document.getElementById('search-input').value;
    if (searchTerm.trim()) {
        // *** REAL-WORLD IMPLEMENTATION: ***
        // This is where you would call your News API's search endpoint 
        // using the 'searchTerm' and display the results using displayNews().
        console.log("Searching for:", searchTerm);

        newsContainer.innerHTML = `<div id="loading-message"><div class="loading-spinner"></div>Searching for "${searchTerm}"... (API search logic goes here)</div>`;
        
        // Simulating a result load delay
        setTimeout(fetchGeneralNews, 2000); 
    }
}

function filterNews(category) {
    // This function will only filter the currently displayed cards.
    const cards = document.querySelectorAll('.news-card');
    cards.forEach(card => {
        const categoryElement = card.querySelector('.news-category');
        if (categoryElement) {
            const cardCategory = categoryElement.textContent.toLowerCase();
            if (category === 'all') {
                card.style.display = 'block';
            } else {
                card.style.display = cardCategory === category ? 'grid' : 'none'; // Use 'grid' for news-card parent
            }
        }
    });
}

// Global utility functions (Like, Bookmark, Share, etc.) are kept here for completeness
window.readFullArticle = function(newsId) {
    alert('Opening full article... (In a real app, this would navigate to the full article page)');
}

window.toggleLike = function(newsId, button) {
    button.classList.toggle('liked');
    // Simplified interaction without updating the real API
    const icon = button.querySelector('i');
    if (button.classList.contains('liked')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
    }
}

window.toggleBookmark = function(newsId, button) {
    button.classList.toggle('bookmarked');
    button.style.transform = 'scale(1.2)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

window.shareArticle = function(newsId) {
    if (navigator.share) {
        navigator.share({
            title: 'Daily News Article',
            text: 'Check out this interesting news article!',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Article link copied to clipboard!');
        });
    }
}

