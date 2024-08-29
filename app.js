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
