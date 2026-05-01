const input = document.getElementById("taskInput");
const noteInput = document.getElementById("noteInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

// Load from localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Show tasks on page load
renderTasks();

// Add task on button click
addBtn.addEventListener("click", addTask);

// Add task on Enter key
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});
noteInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

function addTask() {
  const text = input.value.trim();
  const note = noteInput.value.trim();
  if (text === "") return;

  tasks.push({ text: text, note: note, completed: false, time: 0, isRunning: false });
  saveTasks();
  renderTasks();
  input.value = "";
  noteInput.value = "";
}

// Global interval for running tasks
setInterval(() => {
  let needsSave = false;
  tasks.forEach((task, index) => {
    if (task.isRunning && !task.completed) {
      task.time = (task.time || 0) + 1;
      needsSave = true;
      const timeDisplay = document.getElementById(`task-time-${index}`);
      if (timeDisplay) {
        timeDisplay.textContent = formatTime(task.time);
      }
    }
  });
  if (needsSave) {
    saveTasks();
  }
}, 1000);

// Save tasks
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Update task count
function updateCount() {
  const pending = tasks.filter(task => !task.completed).length;
  if (tasks.length === 0) {
    taskCount.textContent = "No tasks yet";
  } else if (pending === 0) {
    taskCount.textContent = "All tasks completed!";
  } else {
    taskCount.textContent = `${pending} task${pending !== 1 ? 's' : ''} pending`;
  }
}

// Render tasks
function renderTasks() {
  taskList.innerHTML = "";
  updateCount();

  tasks.forEach((task, index) => {
    const li = document.createElement("li");

    if (task.completed) {
      li.classList.add("completed");
    }

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("task-content");

    const checkbox = document.createElement("div");
    checkbox.classList.add("checkbox");
    checkbox.innerHTML = '<i class="fa-solid fa-check"></i>';

    const textGroup = document.createElement("div");
    textGroup.classList.add("task-text-group");

    const textSpan = document.createElement("span");
    textSpan.classList.add("task-text");
    textSpan.textContent = task.text;
    textGroup.appendChild(textSpan);

    if (task.note) {
      const noteSpan = document.createElement("span");
      noteSpan.classList.add("task-note");
      noteSpan.textContent = task.note;
      textGroup.appendChild(noteSpan);
    }

    contentDiv.appendChild(checkbox);
    contentDiv.appendChild(textGroup);

    // Toggle complete
    contentDiv.addEventListener("click", () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    });

    // Task Actions Container
    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("task-actions");

    // Time Display
    const timeSpan = document.createElement("span");
    timeSpan.classList.add("task-time");
    timeSpan.id = `task-time-${index}`;
    timeSpan.textContent = formatTime(task.time || 0);

    // Play/Pause Button
    const playBtn = document.createElement("button");
    playBtn.classList.add("play-btn");
    playBtn.innerHTML = task.isRunning && !task.completed ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';

    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (task.completed) return; // Don't run timer if completed
      tasks[index].isRunning = !tasks[index].isRunning;
      playBtn.innerHTML = tasks[index].isRunning ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
      saveTasks();
    });

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.classList.add("delete-btn");
    delBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';

    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      
      // Add animate out before removing
      li.style.animation = "slideOut 0.3s ease-in forwards";
      setTimeout(() => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
      }, 250);
    });

    actionsDiv.appendChild(timeSpan);
    actionsDiv.appendChild(playBtn);
    actionsDiv.appendChild(delBtn);

    li.appendChild(contentDiv);
    li.appendChild(actionsDiv);
    taskList.appendChild(li);
  });
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}