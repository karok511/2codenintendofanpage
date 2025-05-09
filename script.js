// Admin authentication
const ADMIN_CODE = 'kaastosti123';
let isAdmin = false;

// Analytics setup
function initAnalytics() {
    // Google Analytics initialization
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX'); // Replace with your actual Google Analytics ID

    // Track page views
    trackPageView();
}

function trackPageView() {
    const pageViews = parseInt(localStorage.getItem('pageViews') || '0');
    localStorage.setItem('pageViews', pageViews + 1);
    
    // Track in Google Analytics
    if (typeof gtag === 'function') {
        gtag('event', 'page_view', {
            'page_title': document.title,
            'page_location': window.location.href,
            'page_path': window.location.pathname
        });
    }
}

// Track news views
function trackNewsView(id) {
    let news = JSON.parse(localStorage.getItem('news') || '[]');
    const newsItem = news.find(item => item.id === id);
    if (newsItem) {
        newsItem.views = (newsItem.views || 0) + 1;
        localStorage.setItem('news', JSON.stringify(news));
        
        // Track in Google Analytics
        if (typeof gtag === 'function') {
            gtag('event', 'news_view', {
                'news_id': id,
                'news_title': newsItem.title
            });
        }
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    setupAdminPanel();
    setupNavigation();
    checkAdminStatus();
    initAnalytics();
    
    // Add login button to header if not logged in
    if (!isAdmin) {
        const nav = document.querySelector('nav ul');
        const loginItem = document.createElement('li');
        loginItem.innerHTML = '<a href="#" onclick="login(); return false;">Admin Login</a>';
        nav.appendChild(loginItem);
    }
});

// Check if user is already logged in
function checkAdminStatus() {
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
        isAdmin = true;
        showAdminPanel();
    }
}

// Login function
function login() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_CODE) {
        isAdmin = true;
        localStorage.setItem('isAdmin', 'true');
        showAdminPanel();
        document.getElementById('adminPassword').value = '';
    } else {
        alert('Invalid admin code!');
    }
}

// Nieuws toevoegen
function addNews() {
    const title = document.getElementById('newsTitle').value;
    const content = document.getElementById('newsContent').value;
    const imageFile = document.getElementById('newsImage')?.files[0];
    
    if (!title || !content) {
        alert('Vul alle velden in!');
        return;
    }

    const newsItem = {
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toLocaleDateString('nl-NL'),
        author: 'Admin',
        views: 0
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newsItem.image = e.target.result;
            saveNewsItem(newsItem);
        }
        reader.readAsDataURL(imageFile);
    } else {
        saveNewsItem(newsItem);
    }
}

function saveNewsItem(newsItem) {
    let news = JSON.parse(localStorage.getItem('news') || '[]');
    news.unshift(newsItem);
    localStorage.setItem('news', JSON.stringify(news));

    // Track news creation
    if (typeof gtag === 'function') {
        gtag('event', 'news_created', {
            'news_title': newsItem.title
        });
    }

    // Reset form
    document.getElementById('newsTitle').value = '';
    document.getElementById('newsContent').value = '';
    if (document.getElementById('newsImage')) {
        document.getElementById('newsImage').value = '';
    }
    if (document.getElementById('imagePreview')) {
        document.getElementById('imagePreview').innerHTML = '';
    }

    loadNews();
    alert('Nieuws item succesvol toegevoegd!');
}

// Nieuws verwijderen
function deleteNews(id) {
    if (confirm('Weet je zeker dat je dit nieuws item wilt verwijderen?')) {
        let news = JSON.parse(localStorage.getItem('news') || '[]');
        news = news.filter(item => item.id !== id);
        localStorage.setItem('news', JSON.stringify(news));
        loadNews();
    }
}

// Laad nieuws items
function loadNews() {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;

    const news = JSON.parse(localStorage.getItem('news') || '[]');

    newsContainer.innerHTML = news.map(item => `
        <div class="news-item" onclick="trackNewsView(${item.id})">
            <h3>${item.title}</h3>
            <p class="date">${item.date} - ${item.author}</p>
            <p>${item.content}</p>
            ${item.image ? `<img src="${item.image}" alt="${item.title}">` : ''}
            <p class="views">Views: ${item.views || 0}</p>
            ${isAdmin ? `<button onclick="deleteNews(${item.id})" class="delete-btn">Verwijderen</button>` : ''}
        </div>
    `).join('');
}

// Admin panel setup
function setupAdminPanel() {
    const adminSection = document.getElementById('admin');
    const adminLink = document.getElementById('adminLink');
    
    if (adminLink && adminSection) {
        adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            adminSection.classList.remove('hidden');
            adminSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// Navigatie setup
function setupNavigation() {
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Show/hide admin panel
function showAdminPanel() {
    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');
    
    if (loginSection) loginSection.classList.add('hidden');
    if (adminPanel) adminPanel.classList.remove('hidden');
}

function hideAdminPanel() {
    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');
    
    if (loginSection) loginSection.classList.remove('hidden');
    if (adminPanel) adminPanel.classList.add('hidden');
}

// Image preview functionality
const newsImage = document.getElementById('newsImage');
if (newsImage) {
    newsImage.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('imagePreview');
                if (preview) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                }
            }
            reader.readAsDataURL(file);
        }
    });
}

// News form submission
const newsForm = document.getElementById('newsForm');
if (newsForm) {
    newsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addNews();
    });
}

// Logout function
function logout() {
    isAdmin = false;
    localStorage.removeItem('isAdmin');
    hideAdminPanel();
    loadNews(); // Herlaad nieuws om delete knoppen te verbergen
} 