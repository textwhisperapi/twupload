async function upload() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Pick a file");

  // Try to get username from session-injected JS or fallback to input
  const username = window.currentUsername || document.getElementById("usernameInput").value.trim();
  const surrogateId = window.currentSurrogate || document.getElementById("surrogateInput").value.trim();

  if (!username || !surrogateId) {
    return alert("Username and surrogate ID are required.");
  }

  const key = `${username}/surrogate-${surrogateId}/files/${file.name}`;
  const uploadUrl = "https://r2-worker.textwhisper.workers.dev/?key=" + encodeURIComponent(key);
  const publicUrl = "https://pub-1afc23a510c147a5a857168f23ff6db8.r2.dev/" + encodeURIComponent(key);

  
  const xhr = new XMLHttpRequest();
  xhr.open("POST", uploadUrl, true);
  xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

  const startTime = Date.now();
  document.getElementById("stage").textContent = "Uploading to R2…";

  xhr.upload.onprogress = function(e) {
    if (e.lengthComputable) {
      const percent = (e.loaded / e.total) * 100;
      document.getElementById("progressBar").style.width = percent.toFixed(1) + "%";
      document.getElementById("progressBar").textContent = percent.toFixed(1) + "%";

      const elapsed = (Date.now() - startTime) / 1000;
      const speed = (e.loaded / (1024*1024)) / elapsed;
      const remaining = e.total - e.loaded;
      const eta = remaining > 0 ? (remaining / (1024*1024)) / speed : 0;

      document.getElementById("stats").textContent =
        `Progress: ${percent.toFixed(1)}% | Elapsed: ${elapsed.toFixed(1)}s | Speed: ${speed.toFixed(2)} MB/s | ETA: ${eta.toFixed(1)}s`;
    }
  };

  xhr.onload = function() {
    const elapsed = (Date.now() - startTime) / 1000;
    if (xhr.status === 200) {
      document.getElementById("stats").textContent += ` | ✅ Done in ${elapsed.toFixed(1)}s`;
      document.getElementById("stage").textContent = "✅ Uploaded to R2: " + file.name;
      document.getElementById("output").textContent = xhr.responseText;

      const a = document.createElement("a");
      a.href = publicUrl;
      a.textContent = "Open uploaded file";
      a.target = "_blank";
      document.body.appendChild(a);
    } else {
      document.getElementById("stage").textContent = "❌ Upload failed (" + xhr.status + ")";
      document.getElementById("output").textContent = xhr.responseText;
    }
  };

  xhr.onerror = function() {
    document.getElementById("stage").textContent = "❌ Connection error";
  };

  xhr.send(file);
}

async function listFiles() {
  const username = window.currentUsername || document.getElementById("usernameInput").value.trim();
  const surrogateId = window.currentSurrogate || document.getElementById("surrogateInput").value.trim();

  if (!username || !surrogateId) {
    return alert("Username and surrogate ID are required.");
  }

  const prefix = `${username}/surrogate-${surrogateId}/files/`;
  const resp = await fetch(`https://r2-worker.textwhisper.workers.dev/list?prefix=${encodeURIComponent(prefix)}`);
  const data = await resp.json();

  const list = document.getElementById("fileList");
  list.innerHTML = "";

  if (Array.isArray(data)) {
    data.forEach(obj => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = `https://pub-1afc23a510c147a5a857168f23ff6db8.r2.dev/${encodeURIComponent(obj.key)}`;
      link.textContent = obj.key.split("/").pop();
      link.target = "_blank";
      li.appendChild(link);
      list.appendChild(li);
    });
  } else {
    list.innerHTML = "<li>No files found or error loading list.</li>";
  }
}

