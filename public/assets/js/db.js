const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (event) => {
  event.target.result.createObjectStore("pending", {
    keyPath: "id",
    autoIncrement: true,
  });
};

request.onerror = (err) => {
  console.log(err.message);
};

request.onsuccess = (event) => {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

// Function init in index.js when the user creates an offline trx
function saveRecord(record) {
  const transaction = db.transaction("pending", "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}

// Called when the user returns online to send transactions stored in db.js to the server
function checkDatabase() {
  const transaction = db.transaction("pending", "readonly");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction("pending", "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}

// Listen for app to come back online
window.addEventListener("online", checkDatabase);
