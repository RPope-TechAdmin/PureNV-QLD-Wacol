// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const output = document.getElementById('output');
const form = document.getElementById('upload-form');
const warningDiv = document.getElementById('feedback-resp');
const dropZoneText = document.getElementById('drop-area-text');
let selectedFile = null;

// Click-to-open file picker
dropZone.addEventListener('click', () => fileInput.click());

// Drag-over effects
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) {
    selectedFile = file;
    fileInput.files = e.dataTransfer.files;
    dropZoneText.textContent = `Selected File: ${file.name}`;
  }
});
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile = file;
    dropZoneText.textContent = `Selected File: ${file.name}`;
  }
});

// ✅ Handle form submission
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // prevent default form reload
  
  if (!warningDiv) {
    console.error("Element with ID 'feedback-resp' not found in the DOM!");
    return;
  }

  if (selectedFile.type !== "application/pdf") {
  warningDiv.textContent = "⚠️ Only PDF files are allowed.";
  return;
}

if (selectedFile.size > 4 * 1024 * 1024) {
  warningDiv.textContent = "⚠️ File size exceeds 4MB limit.";
  return;
}

  const queryType = document.getElementById('query-type').value;
  warningDiv.textContent = ""; // clear old message

  if (!queryType) {
    warningDiv.textContent = "⚠️ Please select a query type.";
    return;
  }

  if (!selectedFile) {
    warningDiv.textContent = "⚠️ Please select or drag a PDF file.";
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("query_type", queryType);

  try {
    const response = await fetch("https://wacol-backend-wacol-chfkcfbeatctcyh7.australiaeast-01.azurewebsites.net/api/lab-data", {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json"
      }
    })
    .then(response=>response.json());

    console.log("➡️ Uploading")
    
    const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (jsonErr) {
    console.log("❌ JSON parse error:", jsonErr.message);
    data = { error: "Invalid JSON response", raw: text };
  }

  if (!response.ok) {
    console.log("🚨 Server error:", data);
    output.textContent = `Upload failed: ${data?.error || "Unknown error"}`;
  } else {
    warningDiv.textContent = response.json;
  }
} catch (err) {
  console.log("🚨 Upload error:", err.message);
  output.textContent = "Upload failed. Network or server error.";
}})