let db;

const request = window.indexedDB.open("budgetList", 1);

request.onupgradeneeded = function ({ taget }) {
  let db = target.result;
  db.createObjectStore("budgetStore", { autoIncrement: true });
};

request.onsuccess = function ({ target }) {
  db = target.result;
  if (navigator.onLine) {
    checkDB();
  }
};

function saveRecord(record) {
  const trans = db.trans(["budgetStore"], "readwrite");
  const save = trans.createObjectStore("budgetStore");
  save.add(record);
}

function checkDB() {
  const trans = db.trans(["budgetStore"], "readwrite");
  const save = trans.createObjectStore("budgetStore");
  const getAll = save.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then(() => {
          const saveInfo = db.trans("budgetStore", "readwrite");
          const store = saveInfo.objectStore("budgetStore");
          store.clear();
        });
    }
  };
}
window.addEventListener("offline", checkDB);
