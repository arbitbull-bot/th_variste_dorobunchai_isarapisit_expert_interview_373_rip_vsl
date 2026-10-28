// === BINOM VIDEO TRACKER ===

// 1. clickid из localStorage (кладётся блоком phpClickId в <head> index.html)
var clickId = localStorage.getItem('clickid');

// 2. Если пусто — 'no_Id'
if (!clickId || clickId === 'no_Id') {
  clickId = 'no_Id';
  console.warn('ClickID не найден, используется fallback ID.');
}

var urlParams = new URLSearchParams(window.location.search);
var campaignId = urlParams.get('campaign_id') || 'default_campaign';

// Серверный прокси событий (пересылает в Binom)
var EVENT_PROXY_URL = '../../track_event_proxy.php';

function sendBinomEvent(eventNumber, value) {
  if (typeof value === 'undefined') value = 1;
  var url = EVENT_PROXY_URL
    + '?clickid=' + encodeURIComponent(clickId)
    + '&event=' + encodeURIComponent(eventNumber)
    + '&value=' + encodeURIComponent(value);
  var img = new Image();
  img.src = url;
}

// Чекпоинты
var videoEvents = [
  { time: 127, event: 3 }, // начало блока 2
  { time: 255, event: 4 }, // начало блока 3
  { time: 382, event: 5 }, // начало блока 4
  { time: 510, event: 6 }, // начало блока 5
  { time: 637, event: 7 }, // начало блока 6
  { time: 764, event: 8 }, // начало блока 7
  { time: 168, event: 9 }, // момент показа формы
  { time: 892, event: 10 } // досмотр (7/8 длины)
];

var event1Interval = null;
var event1Value = 0;
var started = false;
var active = false;

function playVideo() {
  if (started) return;
  started = true;
  active = true;

  var video = document.getElementById('video');
  var playOverlay = document.getElementById('play');
  var progressBar = document.getElementById('progress-bar');
  var orderElement = document.getElementById('order');

  try {
    video.muted = false;
    video.currentTime = 0;
    if (playOverlay) playOverlay.style.display = 'none';
    video.play();
  } catch (e) {}

  // event2 — старт просмотра
  sendBinomEvent(2, 1);

  event1Value = 0;
  // event1: +5 каждые 5 секунд, останавливается по «назад»
  event1Interval = setInterval(function () {
    if (!active) return;
    event1Value += 5;
    sendBinomEvent(1, event1Value);
  }, 5000);

  var triggeredEvents = new Set();
  var formShown = false;

  var timeupdateHandler = function () {
    var videoTime = 0;
    var duration = 0;
    var currentTime = 0;

    if (video && !isNaN(video.currentTime)) {
      currentTime = video.currentTime;
      videoTime = Math.trunc(currentTime);
      duration = video.duration || 0;
    }

    // Прогресс-бар: первые 180 сек — 50%, остаток — ещё 50%
    if (progressBar) {
      var firstPhaseDuration = 180;
      var secondPhaseDuration = (duration > firstPhaseDuration) ? (duration - firstPhaseDuration) : 1;
      var progress = 0;
      if (currentTime <= firstPhaseDuration) {
        progress = (currentTime / firstPhaseDuration) * 50;
      } else {
        var secondPhaseTime = currentTime - firstPhaseDuration;
        progress = 50 + (secondPhaseTime / secondPhaseDuration) * 50;
      }
      progressBar.style.width = Math.max(0, Math.min(100, progress)) + '%';
    }

    if (active) {
      videoEvents.forEach(function (evt) {
        if (videoTime >= evt.time && !triggeredEvents.has(evt.event)) {
          sendBinomEvent(evt.event, 1);
          triggeredEvents.add(evt.event);
        }
      });
    }

    // Показ формы после 168 секунд
    if (videoTime >= 168 && !formShown) {
      formShown = true;
      if (orderElement) orderElement.style.display = 'block';
      startTimer();
    }
  };

  if (video) {
    video.addEventListener('timeupdate', timeupdateHandler);
    video.addEventListener('ended', function () {
      clearInterval(event1Interval);
      event1Interval = null;
      active = false;
    });
  } else {
    setTimeout(function () {
      if (event1Interval) { clearInterval(event1Interval); event1Interval = null; }
      active = false;
    }, 60 * 60 * 1000);
  }

  // «Назад» останавливает event1 и чекпоинты
  window.addEventListener('popstate', function () {
    if (event1Interval) {
      clearInterval(event1Interval);
      event1Interval = null;
    }
    active = false;
  });
}

document.addEventListener('DOMContentLoaded', function () {
  var playButton = document.getElementById('play');
  if (playButton) {
    playButton.addEventListener('click', function () {
      playVideo();
    });
  }

  // --- Спиннер загрузки ---
  const spinnerContainer = document.querySelector('.spinner-container');
  const spinner = document.querySelector('.spinner');
  const videoElement = document.getElementById('video');
  if (!spinnerContainer || !spinner || !videoElement) return;

  let progress = 0;
  let loadingFinished = false;
  let simulateLoading;
  let dotsInterval;
  let videoCheckInterval;

  function finishLoading() {
    const finishInterval = setInterval(() => {
      progress += 3;
      spinner.textContent = `${Math.floor(progress)}%`;
      if (progress >= 100) {
        clearInterval(finishInterval);
        spinnerContainer.classList.add('d-none');
        videoElement.play();
      }
    }, 50);
  }

  function startFastLoading() {
    simulateLoading = setInterval(() => {
      if (loadingFinished) return;
      const step = Math.random() * 8 + 2;
      progress = Math.min(progress + step, 99);
      spinner.textContent = `${Math.floor(progress)}%`;
    }, 120);
  }

  function slowLoading() {
    clearInterval(simulateLoading);
    simulateLoading = setInterval(() => {
      if (loadingFinished) return;
      const step = Math.random() * 2 + 0.5;
      progress = Math.min(progress + step, 99);
      spinner.textContent = `${Math.floor(progress)}%`;
    }, 300);
  }

  function startDotsAnimation() {
    let dots = 0;
    dotsInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      spinner.textContent = `99%${'.'.repeat(dots)}`;
    }, 500);
  }

  function startVideoCheck() {
    videoCheckInterval = setInterval(() => {
      if (loadingFinished) return;
      if (videoElement.readyState >= 3) {
        loadingFinished = true;
        clearInterval(simulateLoading);
        clearInterval(dotsInterval);
        clearInterval(videoCheckInterval);
        finishLoading();
      }
    }, 2000);
  }

  startFastLoading();

  videoElement.addEventListener('canplaythrough', () => {
    if (loadingFinished) return;
    loadingFinished = true;
    clearInterval(simulateLoading);
    clearInterval(dotsInterval);
    clearInterval(videoCheckInterval);
    finishLoading();
  });

  setTimeout(() => {
    if (!loadingFinished) slowLoading();
  }, 3000);

  setTimeout(() => {
    if (!loadingFinished) {
      clearInterval(simulateLoading);
      progress = 99;
      spinner.textContent = `99%`;
      startDotsAnimation();
      startVideoCheck();
    }
  }, 6000);
});

document.addEventListener('contextmenu', function (event) {
  event.preventDefault();
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'F12' ||
    (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J')) ||
    (event.ctrlKey && event.key === 'U')) {
    event.preventDefault();
  }
});

// Таймер в форме (5 минут), стартует при показе формы
let timerInterval;

function startTimer() {
  const el = document.querySelector('.timer');
  if (!el) return;
  let totalSeconds = 5 * 60;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    el.textContent = minutes + ':' + seconds;
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
    }
    totalSeconds--;
  }, 1000);
}
