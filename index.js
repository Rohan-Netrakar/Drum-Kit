// Sound mapping
const sounds = {
  w: "sounds/tom-1.mp3",
  a: "sounds/tom-2.mp3",
  s: "sounds/tom-3.mp3",
  d: "sounds/tom-4.mp3",
  j: "sounds/crash.mp3",
  k: "sounds/kick-bass.mp3",
  l: "sounds/snare.mp3",
};

// Create audio elements
const audioElements = {};
for (const key in sounds) {
  audioElements[key] = new Audio(sounds[key]);
}

// Visualizer setup
const visualizer = document.getElementById("visualizer");
for (let i = 0; i < 32; i++) {
  const bar = document.createElement("div");
  bar.className = "bar";
  bar.style.height = `${Math.random() * 50 + 10}px`;
  visualizer.appendChild(bar);
}

// Animation for bars
const bars = document.querySelectorAll(".bar");
function animateBars() {
  bars.forEach((bar) => {
    const newHeight = Math.random() * 60 + 10;
    bar.style.height = `${newHeight}px`;
  });
}

// Set interval for visualizer animation
setInterval(animateBars, 200);

// Recording state
let isRecording = false;
let isPlaying = false;
let recordingStartTime;
let currentRecording = [];
let recordings = JSON.parse(localStorage.getItem("drumRecordings")) || [];

// DOM elements
const recordBtn = document.getElementById("recordBtn");
const playBtn = document.getElementById("playBtn");
const demoBtn = document.getElementById("demoBtn");
const clearBtn = document.getElementById("clearBtn");
const recordingsList = document.getElementById("recordingsList");
const saveModal = document.getElementById("saveModal");
const closeModal = document.getElementById("closeModal");
const saveRecordingBtn = document.getElementById("saveRecordingBtn");
const recordingNameInput = document.getElementById("recordingName");

// Initialize recordings list
renderRecordingsList();

// Play sound function
function playSound(key) {
  if (!audioElements[key]) return;

  // Play audio
  const audio = audioElements[key].cloneNode();
  audio.play();

  // Create visual feedback
  const button = document.querySelector(`.${key}`);
  if (button) {
    button.classList.add("pressed");
    setTimeout(() => button.classList.remove("pressed"), 150);

    // Create particles
    createParticles(button);
  }

  // If recording, add to current recording
  if (isRecording) {
    const time = Date.now() - recordingStartTime;
    currentRecording.push({ key, time });
  }

  // Enhance visualizer animation
  const randomBars = Array.from({ length: 5 }, () =>
    Math.floor(Math.random() * bars.length)
  );

  randomBars.forEach((index) => {
    bars[index].style.transition = "height 0.1s ease";
    bars[index].style.height = "80px";
    setTimeout(() => {
      bars[index].style.transition = "height 0.3s ease";
      bars[index].style.height = `${Math.random() * 50 + 10}px`;
    }, 100);
  });
}

// Create particles effect
function createParticles(element) {
  const colors = {
    w: "#7B68EE",
    a: "#FF6B6B",
    s: "#6AB04C",
    d: "#FFC107",
    j: "#2196F3",
    k: "#E91E63",
    l: "#9C27B0",
  };

  const color = colors[element.classList[0]];
  const particleCount = 12;
  const container = document.createElement("div");
  container.className = "particles";
  element.appendChild(container);

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.backgroundColor = color;
    particle.style.left = "50%";
    particle.style.top = "50%";
    container.appendChild(particle);

    // Animate particle
    const angle = (Math.PI * 2 * i) / particleCount;
    const distance = 50 + Math.random() * 50;
    const duration = 600 + Math.random() * 400;

    particle.animate(
      [
        {
          transform: "translate(-50%, -50%)",
          opacity: 1,
          width: "6px",
          height: "6px",
        },
        {
          transform: `translate(${Math.cos(angle) * distance}px, ${
            Math.sin(angle) * distance
          }px)`,
          opacity: 0,
          width: "2px",
          height: "2px",
        },
      ],
      {
        duration: duration,
        easing: "ease-out",
        fill: "forwards",
      }
    );
  }

  // Remove container after animation
  setTimeout(() => container.remove(), 1000);
}

// Button click handlers
document.querySelectorAll(".drum").forEach((button) => {
  button.addEventListener("click", function () {
    const key = this.classList[0];
    playSound(key);
  });
});

// Keyboard event listener
document.addEventListener("keydown", function (event) {
  const key = event.key.toLowerCase();
  if (sounds[key]) {
    playSound(key);
  }
});

// Record button functionality
recordBtn.addEventListener("click", function () {
  if (isRecording) {
    // Stop recording
    isRecording = false;
    this.classList.remove("active");
    this.innerHTML = '<i class="fas fa-record-vinyl"></i> Record';

    // Show save modal if we have a recording
    if (currentRecording.length > 0) {
      saveModal.classList.add("active");
    }
  } else {
    // Start recording
    isRecording = true;
    recordingStartTime = Date.now();
    currentRecording = [];
    this.classList.add("active");
    this.innerHTML = '<span class="recording-indicator"></span> Recording...';
  }
});

// Play button functionality
playBtn.addEventListener("click", function () {
  if (isPlaying) return;

  if (currentRecording.length === 0) {
    alert("No recording to play! Record something first.");
    return;
  }

  isPlaying = true;
  this.classList.add("active");
  this.innerHTML = '<i class="fas fa-stop"></i> Stop';

  let lastTime = 0;
  currentRecording.forEach((event, index) => {
    setTimeout(() => {
      playSound(event.key);

      // If last event, reset button
      if (index === currentRecording.length - 1) {
        setTimeout(() => {
          isPlaying = false;
          playBtn.classList.remove("active");
          playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        }, 500);
      }
    }, lastTime + event.time);
    lastTime = event.time;
  });
});

// Demo button functionality
demoBtn.addEventListener("click", function () {
  // Demo mode - play a sequence of sounds
  const keys = ["w", "a", "s", "d", "j", "k", "l"];
  this.disabled = true;
  this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Playing...';

  let i = 0;
  const interval = setInterval(() => {
    if (i >= 12) {
      clearInterval(interval);
      this.disabled = false;
      this.innerHTML = '<i class="fas fa-magic"></i> Demo';
      return;
    }

    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    playSound(randomKey);
    i++;
  }, 300);
});

// Clear button functionality
clearBtn.addEventListener("click", function () {
  if (confirm("Are you sure you want to clear the current recording?")) {
    currentRecording = [];
    playBtn.classList.remove("active");
    playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
  }
});

// Save recording button
saveRecordingBtn.addEventListener("click", function () {
  const name = recordingNameInput.value.trim();
  if (!name) {
    alert("Please enter a name for your recording");
    return;
  }

  // Create recording object
  const recording = {
    id: Date.now(),
    name: name,
    data: [...currentRecording], // Clone the array
  };

  // Add to recordings
  recordings.unshift(recording);

  // Save to localStorage
  localStorage.setItem("drumRecordings", JSON.stringify(recordings));

  // Close modal and reset
  saveModal.classList.remove("active");
  recordingNameInput.value = "";

  // Update recordings list
  renderRecordingsList();
});

// Close modal button
closeModal.addEventListener("click", function () {
  saveModal.classList.remove("active");
});

// Render recordings list
function renderRecordingsList() {
  if (recordings.length === 0) {
    recordingsList.innerHTML =
      '<div class="no-recordings">No recordings yet. Start recording to save your drum sequences!</div>';
    return;
  }

  recordingsList.innerHTML = "";
  recordings.forEach((recording) => {
    const item = document.createElement("div");
    item.className = "recording-item";
    item.innerHTML = `
          <div class="recording-name">${recording.name}</div>
          <div class="recording-actions">
            <button class="action-btn play-btn" data-id="${recording.id}">
              <i class="fas fa-play"></i> Play
            </button>
            <button class="action-btn delete-btn" data-id="${recording.id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        `;
    recordingsList.appendChild(item);
  });

  // Add event listeners to the new buttons
  document.querySelectorAll(".play-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      playRecording(this.dataset.id);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      deleteRecording(this.dataset.id);
    });
  });
}

// Play a saved recording
function playRecording(id) {
  if (isPlaying) return;

  const recording = recordings.find((r) => r.id == id);
  if (!recording) return;

  isPlaying = true;
  document.querySelector(`.play-btn[data-id="${id}"]`).innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Playing';

  let lastTime = 0;
  recording.data.forEach((event, index) => {
    setTimeout(() => {
      playSound(event.key);

      // If last event, reset button
      if (index === recording.data.length - 1) {
        setTimeout(() => {
          isPlaying = false;
          document.querySelector(`.play-btn[data-id="${id}"]`).innerHTML =
            '<i class="fas fa-play"></i> Play';
        }, 500);
      }
    }, lastTime + event.time);
    lastTime = event.time;
  });
}

// Delete a recording
function deleteRecording(id) {
  if (confirm("Are you sure you want to delete this recording?")) {
    recordings = recordings.filter((r) => r.id != id);
    localStorage.setItem("drumRecordings", JSON.stringify(recordings));
    renderRecordingsList();
  }
}
