// App.js
import React, { useState, useEffect } from "react";

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

function App() {
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem(CURRENT_USER_KEY) || null
  );
  const [users, setUsers] = useState(
    JSON.parse(localStorage.getItem(USERS_KEY)) || []
  );
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([
    "Food",
    "Travel",
    "Bills",
    "Shopping",
  ]);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    if (currentUser) {
      setTransactions(
        JSON.parse(localStorage.getItem("transactions_" + currentUser)) || []
      );
      setCategories(
        JSON.parse(localStorage.getItem("categories_" + currentUser)) ||
          categories
      );
      setBudget(JSON.parse(localStorage.getItem("budget_" + currentUser)) || 0);
    }
  }, [currentUser]);

  const saveTransactions = (newTransactions) => {
    setTransactions(newTransactions);
    localStorage.setItem(
      "transactions_" + currentUser,
      JSON.stringify(newTransactions)
    );
  };

  const saveCategories = (newCategories) => {
    setCategories(newCategories);
    localStorage.setItem(
      "categories_" + currentUser,
      JSON.stringify(newCategories)
    );
  };

  const handleRegister = (username, password) => {
    if (!username || !password) return false;
    if (users.find((u) => u.username === username)) return false;
    const newUsers = [...users, { username, password }];
    setUsers(newUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
    return true;
  };

  const handleLogin = (username, password) => {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      setCurrentUser(username);
      localStorage.setItem(CURRENT_USER_KEY, username);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const addTransaction = (t) => {
    const newTransactions = [...transactions, t];
    saveTransactions(newTransactions);
    const totalExpenses = newTransactions
      .filter((tr) => tr.type === "expense")
      .reduce((sum, tr) => sum + tr.amount, 0);
    if (budget > 0 && totalExpenses > budget) alert("⚠️ Budget exceeded!");
  };

  const deleteTransaction = (id) => {
    saveTransactions(transactions.filter((t) => t.id !== id));
  };

  const addCategory = (c) => {
    if (!categories.includes(c)) {
      const newCategories = [...categories, c];
      saveCategories(newCategories);
    }
  };

  const setBudgetAmount = (b) => {
    setBudget(b);
    localStorage.setItem("budget_" + currentUser, JSON.stringify(b));
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="app-container">
      <header>
        <h2>Welcome, {currentUser}</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="cards-container">
        <Transactions
          transactions={transactions}
          categories={categories}
          addTransaction={addTransaction}
          deleteTransaction={deleteTransaction}
        />
        <Categories categories={categories} addCategory={addCategory} />
        <Budget budget={budget} setBudget={setBudgetAmount} />
      </div>
    </div>
  );
}

// Dark themed login form like Amazon
function LoginForm({ onLogin, onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  return (
    <div className="login-container">
      <h1>Expense Tracker</h1>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={() => {
          if (onLogin(username, password)) setMsg("");
          else setMsg("Invalid login");
        }}
      >
        Login
      </button>
      <button
        onClick={() => {
          if (onRegister(username, password)) setMsg("Registered! Login now.");
          else setMsg("Username exists.");
        }}
      >
        Register
      </button>
      <p className="msg">{msg}</p>
    </div>
  );
}

// Transactions, Categories, Budget - all dark themed cards
function Transactions({
  transactions,
  categories,
  addTransaction,
  deleteTransaction,
}) {
  const handleAdd = () => {
    const type = prompt("Type: income/expense");
    const amount = parseFloat(prompt("Amount:"));
    const category = prompt("Category:");
    const description = prompt("Description:");
    const date = prompt(
      "Date (YYYY-MM-DD)",
      new Date().toISOString().split("T")[0]
    );
    if (type && !isNaN(amount) && category && description) {
      addTransaction({
        id: Date.now(),
        type,
        amount,
        category,
        description,
        date,
      });
    } else {
      alert("Invalid input");
    }
  };

  return (
    <div className="card">
      <h3>Transactions</h3>
      <button onClick={handleAdd}>Add</button>
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        transactions.map((t) => (
          <div key={t.id} className="transaction-item">
            <span>{`${t.date} | ${t.type} | ${t.category} | ₹${t.amount} | ${t.description}`}</span>
            <button
              className="delete-btn"
              onClick={() => deleteTransaction(t.id)}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

function Categories({ categories, addCategory }) {
  const handleAdd = () => {
    const c = prompt("Category name:");
    if (c) addCategory(c);
  };
  return (
    <div className="card">
      <h3>Categories</h3>
      <button onClick={handleAdd}>Add</button>
      {categories.map((c, i) => (
        <div key={i}>{c}</div>
      ))}
    </div>
  );
}

function Budget({ budget, setBudget }) {
  const handleSet = () => {
    const b = parseFloat(prompt("Enter budget:"));
    if (!isNaN(b)) setBudget(b);
  };
  return (
    <div className="card">
      <h3>Budget</h3>
      <button onClick={handleSet}>Set</button>
      <p>Current: ₹{budget}</p>
    </div>
  );
}

export default App;
