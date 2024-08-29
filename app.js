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
    console.log("Player state has changed");
}

function fetchVideoDetails(videoId) {
    return gapi.client.youtube.videos.list({
        "part": ["snippet", "statistics"],
        "id": videoId
    })
    .then(response => displayVideoDetails(response.result.items[0]),
          err => handleError("Fetch video details error", err));
}