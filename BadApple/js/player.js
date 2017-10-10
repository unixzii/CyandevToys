var controlEl = document.getElementById('control');
var fileSelector = document.getElementById('file-selector');
var stageEl = document.getElementById('stage');
var videoEl, canvasEl;
var rowEls = [];
var rows;

var videoWidth = 64;
var videoHeight = 48;
var inverse = true;    // "black on white" or "white on black"? It's up to you.

var ws = new WebSocket('ws://localhost:8080');

function inflateStage() {
  rows.forEach(function (elt, i) {
    rowEls[i].innerHTML = elt;
  });
}

function characterFromGrayscale(gs) {
  if (gs > 220) {
    return '&';
  } else if (gs > 200) {
    return '&';
  } else if (gs > 180) {
    return '#';
  } else if (gs > 150) {
    return 'E';
  } else if (gs > 120) {
    return 'Q';
  } else if (gs > 100) {
    return '=';
  } else if (gs > 80) {
    return '_';
  } else if (gs > 40) {
    return '.';
  } else {
    return ' ';
  }
}

function onFrame() {
  var ctx = canvasEl.getContext('2d');

  ctx.clearRect(0, 0, videoWidth, videoHeight);
  ctx.drawImage(videoEl, 0, 0, videoWidth, videoHeight);

  var imageData = ctx.getImageData(0, 0, videoWidth, videoHeight);

  rows = [];

  var rowLength = videoWidth * 4;
  for (var i = 0; i < imageData.height; i++) {
    var rowString = '';
    for (var j = 0; j < imageData.width * 4; j += 4) {
      var r = imageData.data[i * rowLength + j];
      var g = imageData.data[i * rowLength + j + 1];
      var b = imageData.data[i * rowLength + j + 2];
      var a = imageData.data[i * rowLength + j + 3];

      var gs = (r * 0.299 + g * 0.587 + b * 0.114);

      if (inverse) {
        gs = 255 - gs;
      }

      rowString += characterFromGrayscale(gs) + ' ';
    }
    rows.push(rowString);
  }

  if (ws) {
    if (ws.readyState !== ws.OPEN) {
      ws = null;
    } else {
      ws.send(rows.join('\n'));
    }
  } else {
    inflateStage();
  }

  requestAnimationFrame(onFrame);
}

function initPlayer(src) {
  videoEl = document.createElement('video');
  videoEl.src = src;
  videoEl.play();

  canvasEl = document.createElement('canvas');
  canvasEl.width = videoWidth;
  canvasEl.height = videoHeight;

  for (var i = 0; i < videoHeight; i++) {
    var p = document.createElement('p');
    stageEl.appendChild(p);
    rowEls.push(p);
  }

  onFrame();
}

fileSelector.onchange = function (e) {
  controlEl.className = 'fade';
  fileSelector.disabled = true;

  var url = URL.createObjectURL(e.target.files[0]);
  initPlayer(url);
}
