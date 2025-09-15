class Entry {
  constructor(amount, category, date, type) {
    this.amount = amount;
    this.category = category;
    this.date = date;
    this.type = type;
  }

  updateAmount(newAmount) {
    this.amount = newAmount;
    return this;
  }

  updateCategory(newCategory) {
    this.category = newCategory;
    return this;
  }

  toHTML() {
    return `
      <div class="entry-item">
        <p>${this.date}</p>
        <p>${this.type}</p>
        <p>${this.category}</p>
        <p>${this.amount}</p>
      </div>`;
  }
}

class BudgetCalculator {
  constructor() {
    this.entries = [];
  }

  addEntry(entry) {
    this.entries.push(entry);
  }

  saveEntries() {
    localStorage.setItem("entries", JSON.stringify(this.entries));
  }

  loadEntries() {
    const raw = JSON.parse(localStorage.getItem("entries")) || [];
    this.entries = raw.map((o) => {
      const type = String(o.type || "")
        .trim()
        .toLowerCase();
      let amount = Number(o.amount);
      if (!Number.isFinite(amount)) amount = 0;
      if (type === "expense" && amount > 0) amount = -amount;
      return new Entry(amount, o.category, o.date, type);
    });
  }

  getBalance() {
    return this.entries.reduce((acc, e) => acc + e.amount, 0);
  }

  getTotalsByCategory() {
    return this.entries.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount);
      return acc;
    }, {});
  }

  getBalanceByDate(date) {
    return this.entries.reduce((acc, e) => {
      acc[e.date] = (acc[e.date] ?? 0) + Number(e.amount);
      return acc;
    }, {});
  }

  getBalanceByType(type) {
    return this.entries.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] ?? 0) + Number(e.amount);
      return acc;
    }, {});
  }

  renderEntries() {
    const entriesList = document.getElementById("entriesList");
    entriesList.innerHTML = this.entries
      .map((entry) => entry.toHTML())
      .join("");
  }
}

const budgetCalculator = new BudgetCalculator();
budgetCalculator.loadEntries();
budgetCalculator.renderEntries();

document.getElementById("addEntryBtn").addEventListener("click", () => {
  const amount = Number(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;
  const type = document.getElementById("type").value;
  const signed = type === "expense" ? -amount : amount;
  budgetCalculator.addEntry(new Entry(signed, category, date, type));
  document.getElementById("amount").value = "";
  document.getElementById("date").value = "";
  document.getElementById("type").value = "";
  budgetCalculator.renderEntries();
});

document.getElementById("saveEntriesBtn").addEventListener("click", () => {
  budgetCalculator.saveEntries();
  console.log("Entries saved to localStorage");
  budgetCalculator.renderEntries();
});

document.getElementById("getBalanceBtn").addEventListener("click", () => {
  const balance = budgetCalculator.getBalance();
  document.getElementById("balance").textContent = `Balance: $${balance}`;
});

document
  .getElementById("getBalanceByCategoryBtn")
  .addEventListener("click", () => {
    const box = document.getElementById("balanceByCategoryList");
    const totals = budgetCalculator.getTotalsByCategory();
    Object.entries(totals).forEach(([cat, sum]) => {
      const line = document.createElement("div");
      line.textContent = `Category: ${cat} — Balance: ${Number(sum).toFixed(
        2
      )}`;
      box.appendChild(line);
    });
  });

document.getElementById("getBalanceByDateBtn").addEventListener("click", () => {
  const date = document.getElementById("balanceByDateList");
  const totals = budgetCalculator.getBalanceByDate();
  Object.entries(totals).forEach(([cat, sum]) => {
    const line = document.createElement("div");
    line.textContent = `Date: ${cat} — Balance: ${Number(sum).toFixed(2)}`;
    date.appendChild(line);
  });
});

document.getElementById("getBalanceByTypeBtn").addEventListener("click", () => {
  const box = document.getElementById("balanceByTypeList");
  const totals = budgetCalculator.getBalanceByType();
  Object.entries(totals).forEach(([type, sum]) => {
    const line = document.createElement("div");
    line.textContent = `Type: ${type} — Balance: ${Number(sum).toFixed(2)}`;
    box.appendChild(line);
  });
});
