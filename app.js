const expenseForm = document.getElementById("expenseform");
const nameInput = document.getElementById("expense-name");
const amountInput = document.getElementById("expense-amount");
const dateInput = document.getElementById("expense-date");
const categoryInput = document.getElementById("category");
const tableBody = document.getElementById("expense-table-body");
const totalDisplay = document.getElementById("total-expense");
const searchInput = document.getElementById("search");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let editIndex = null;
let expenseChart;

// Save expenses to localStorage
function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Render the chart
function renderChart() {
  const categoryTotals = {};

  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (expenseChart) {
    expenseChart.destroy();
  }

  const ctx = document.getElementById("expense-chart").getContext("2d");
  expenseChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        label: " ",
        data: data,
        backgroundColor: [
          "#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Update total expense
function updateTotal() {
  const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  totalDisplay.textContent = `${total} ₹`;
}

// Render table rows
function renderTable(filteredExpenses = expenses) {
  tableBody.innerHTML = "";

  filteredExpenses.forEach((expense, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${expense.name}</td>
      <td>${expense.amount} ₹</td>
      <td>${expense.date}</td>
      <td>${expense.category}</td>
      <td>
        <button class="btn btn-sm btn-warning me-2" onclick="editExpense(${index})">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteExpense(${index})">
          <i class="bi bi-trash-fill"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Handle form submit
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const amount = amountInput.value.trim();
  const date = dateInput.value;
  const category = categoryInput.value;

  if (!name || !amount || !date || !category) return alert("Please fill all fields");

  const newExpense = { name, amount, date, category };

  if (editIndex !== null) {
    expenses[editIndex] = newExpense;
    editIndex = null;
  } else {
    expenses.push(newExpense);
  }

  saveExpenses();
  renderTable();
  updateTotal();
  renderChart();
  expenseForm.reset();
});

// Edit expense
window.editExpense = function(index) {
  const expense = expenses[index];
  nameInput.value = expense.name;
  amountInput.value = expense.amount;
  dateInput.value = expense.date;
  categoryInput.value = expense.category;
  editIndex = index;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Delete expense
window.deleteExpense = function(index) {
  if (confirm("Are you sure you want to delete this expense?")) {
    expenses.splice(index, 1);
    saveExpenses();
    renderTable();
    updateTotal();
    renderChart();
  }
};

// Search functionality
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filtered = expenses.filter(exp =>
    exp.name.toLowerCase().includes(searchTerm)
  );
  renderTable(filtered);
});

// Initial render
renderTable();
updateTotal();
renderChart();
