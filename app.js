const API_KEY = 'key';

let player;

function loadClient() {
    gapi.client.setApiKey(API_KEY);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(() => console.log("GAPI client loaded for API"),
              err => handleError("Error loading GAPI client for API", err));
}

function execute(query) {
    showLoading();
    return gapi.client.youtube.search.list({
        "part": ["snippet"],
        "maxResults": 10,
        "q": query
    })
    .then(response => {
        hideLoading();
        displayVideoList(response.result.items);
        initializeUI();
    },
    err => handleError("Execute error", err));
}

function displayVideoList(items) {
    const videoList = document.getElementById('video-list');
    videoList.innerHTML = '';
    items.forEach(item => {
        const videoItem = createVideoItem(item);
        videoList.appendChild(videoItem);
    });
}

function createVideoItem(item) {
    const videoItem = document.createElement('div');
    videoItem.classList.add('video-item');
    videoItem.innerHTML = `
        <img src="${item.snippet.thumbnails.medium.url}" alt="${item.snippet.title}">
        <div class="video-item-info">
            <h3>${item.snippet.title}</h3>
            <p>${item.snippet.channelTitle}</p>
        </div>
    `;
    videoItem.addEventListener('click', () => loadVideo(item.id.videoId));
    return videoItem;
}

function loadVideo(videoId) {
    if (player) {
        player.loadVideoById(videoId);
    } else {
        player = new YT.Player('player', {
            height: '360',
            width: '640',
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'autoplay': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
    fetchVideoDetails(videoId);
    fetchRecommendations(videoId);
}

function onPlayerReady(event) {
    console.log("Player is ready");
}

function onPlayerStateChange(event) {
    console.log("Player state changed");
}

function fetchVideoDetails(videoId) {
    return gapi.client.youtube.videos.list({
        "part": ["snippet,statistics"],
        "id": videoId
    })
    .then(response => {
        const videoData = response.result.items[0];
        updateVideoInfo(videoData);
    },
    err => handleError("Error fetching video details", err));
}

function updateVideoInfo(videoData) {
    const videoTitle = document.getElementById('video-title');
    const videoDescription = document.getElementById('video-description');
    
    videoTitle.textContent = videoData.snippet.title;
    videoDescription.textContent = videoData.snippet.description.slice(0, 200) + '...';

    updateSocialShareButtons(videoData.id);
}

function updateSocialShareButtons(videoId) {
    const shareButtons = document.querySelectorAll('.share-btn');
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    shareButtons.forEach(button => {
        const platform = button.getAttribute('data-platform');
        let shareUrl;

        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`;
                break;
            case 'reddit':
                shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(videoUrl)}`;
                break;
        }

        button.addEventListener('click', () => {
            window.open(shareUrl, '_blank');
        });
    });
}

function fetchRecommendations(videoId) {
    showLoading();
    return gapi.client.youtube.search.list({
        "part": ["snippet"],
        "type": "video",
        "relatedToVideoId": videoId,
        "maxResults": 10
    })
    .then(response => {
        hideLoading();
        displayRecommendations(response.result.items);
        initializeUI();
    },
    err => handleError("Error fetching recommendations", err));
}



function displayRecommendations(items) {
    const recommendationList = document.getElementById('recommendation-list');
    recommendationList.innerHTML = '';
    items.forEach(item => {
        const recommendationItem = createRecommendationItem(item);
        recommendationList.appendChild(recommendationItem);
    });
}

function createRecommendationItem(item) {
    const recommendationItem = document.createElement('div');
    recommendationItem.classList.add('recommendation-item');
    recommendationItem.innerHTML = `
        <img src="${item.snippet.thumbnails.medium.url}" alt="${item.snippet.title}">
        <h4>${item.snippet.title}</h4>
    `;
    recommendationItem.addEventListener('click', () => loadVideo(item.id.videoId));
    return recommendationItem;
}

function showLoading() {
    const loadingElement = document.createElement('div');
    loadingElement.classList.add('loading');
    document.body.appendChild(loadingElement);
}

function hideLoading() {
    const loadingElement = document.querySelector('.loading');
    loadingElement.remove();
}

function handleError(message, error) {
    console.error(message, error);
}

function initializeUI() {
    const videoSection = document.getElementById('video-section');
    const recommendationSection = document.getElementById('recommendation-section');
    videoSection.classList.remove('hidden');
    recommendationSection.classList.remove('hidden');
} 

function init() {
    gapi.load("client", loadClient);
}