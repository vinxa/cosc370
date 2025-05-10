let chart;
let youtubePlayer;
let eventData = [];

function loadYouTubeVideo(url) {
  const videoId = url.split('v=')[1]?.split('&')[0];
  if (!videoId) return;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
  const iframe = document.getElementById('youtubePlayer');
  iframe.src = embedUrl;
}

function loadChart(data) {
  const times = data.map(e => e.time);
  const values = data.map(e => e.score);

  const ctx = document.getElementById('scoreChart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: times,
      datasets: [{
        label: 'Score',
        data: values,
        borderColor: 'blue',
        fill: false
      }]
    },
    options: {
      responsive: true,
      onClick: (e) => {
        const point = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true)[0];
        if (point) {
          const time = data[point.index].time;
          seekYouTubeTo(time);
        }
      }
    }
  });
}

function seekYouTubeTo(seconds) {
  youtubePlayer?.contentWindow.postMessage(JSON.stringify({
    event: 'command',
    func: 'seekTo',
    args: [seconds, true]
  }), '*');
}

function setupYouTubeAPI() {
  window.onYouTubeIframeAPIReady = () => {
    youtubePlayer = document.getElementById('youtubePlayer');
  };
}

function playFromStart() {
  seekYouTubeTo(0);
  youtubePlayer?.contentWindow.postMessage(JSON.stringify({
    event: 'command',
    func: 'playVideo'
  }), '*');
}

document.getElementById('loadButton').addEventListener('click', () => {
  const file = document.getElementById('dataFile').files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      eventData = JSON.parse(e.target.result);
      const enrichedData = eventData.map((e, i) => ({
        ...e,
        score: i  // placeholder score increment
      }));
      loadChart(enrichedData);
    } catch (err) {
      alert('Invalid JSON file');
    }
  };
  if (file) reader.readAsText(file);

  const url = document.getElementById('youtubeUrl').value;
  loadYouTubeVideo(url);
});

document.getElementById('playButton').addEventListener('click', playFromStart);

document.addEventListener('DOMContentLoaded', setupYouTubeAPI);