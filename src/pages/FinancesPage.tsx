/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState, useEffect} from "react";
import { Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel, Select, MenuItem, Typography, IconButton, LinearProgress, } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { financesCollection, budgetsCollection } from "@utils/firestore";
import { query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@contexts/AuthContext";
import { FirebaseError } from "firebase/app";

/**
 * FinancesPage.tsx
 *
 * Manages per-user income and expense transactions backed by Firestore.
 * Features: list, add, edit, delete; live totals; pie chart visualization.
 * Security: all queries/writes are user-scoped via `userId`; rules enforce ownership.
 * Error handling: surfaces permission errors; logs unexpected failures.
 * UI: MUI components; Recharts for the pie chart.
 */

// Transaction shape stored/rendered for the table and chart
interface Transaction {
  id: string;
  amount: number;
  type: string;   // "Income" | "Expense"
  date: Date;     // derived from Firestore Timestamp
  description: string;
}

// Pie colors: income (green), expense (red)
const COLORS = ["#4caf50", "#f44336"];

const FinancesPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  /**
   * Fetch the current user's transactions from Firestore.
   * Applies a userId filter to align with security rules.
   */
  const loadTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(financesCollection, where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => {
        const dt = d.data();
        return {
          id: d.id,
          amount: dt.amount as number,
          type: dt.type as string,
          // Firestore Timestamp -> Date for rendering
          date: (dt.date as any).toDate(),
          description: (dt.description as string) || "",
        };
      });
      setTransactions(data);
    } catch (err: any) {
      if (err instanceof FirebaseError && err.code === "permission-denied") {
        alert("User lacks permissions to do that");
      } else {
        console.error("Error Loading Transactions,", err);
        alert("Error at Transaction Load-in");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [user]);

  // Derived totals for the summary cards and pie chart
  const totalIncome = transactions
    .filter(t => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const chartData = [
    { name: "Income", value: totalIncome },
    { name: "Expense", value: totalExpense },
  ];
3
  /**
   * Create or update a transaction.
   * Uses a server timestamp for `date` to avoid client clock drift.
   */
  const handleSave = async () => {
    if (!user || !amount || !type) return;
    const txData = {
      userId: user.uid,
      amount: parseFloat(amount),
      type,
      date: serverTimestamp(),
      description: description.trim(),
    };
    try {
      if (editingTx) {
        const ref = doc(financesCollection, editingTx.id);
        await updateDoc(ref, {
          amount: txData.amount,
          type: txData.type,
          description: txData.description,
        });
        setEditingTx(null);
      } else {
        await addDoc(financesCollection, txData);
      }
      // Reset form and refresh list
      setAmount("");
      setType("");
      setDescription("");
      await loadTransactions();
    } catch (err) {
      if (err instanceof FirebaseError && err.code === "permission-denied") {
        alert("User lacks permissions to do that");
      } else {
        console.error("Error during attempted Save of Transactions,", err);
        alert("Transaction Save Error");
      }
    }
  };

  // Populate the form with the selected row's values for editing
  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setAmount(tx.amount.toString());
    setType(tx.type);
    setDescription(tx.description);
  };

  // Reset form and exit edit mode
  const handleCancel = () => {
    setEditingTx(null);
    setAmount("");
    setType("");
    setDescription("");
  };

  /**
   * Delete a transaction by document id.
   * Optimistically updates local state after Firestore delete.
   */
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(financesCollection, id));
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      if (err instanceof FirebaseError && err.code === "permission-denied") {
        alert("User lacks permissions to do that");
      } else {
        console.error("Error during attempted Delete Transaction,", err);
        alert("Delete Transaction Error");
      }
    }
  };

  const monthKey = new Date().toISOString().slice(0, 7);

const [budgetLimit, setBudgetLimit] = useState<number | null>(null);
const [savingBudget, setSavingBudget] = useState(false);
const [budgetInput, setBudgetInput] = useState<string>("");

// Sum of THIS MONTH's expenses only
const expenseThisMonth = transactions
  .filter(t => t.type === "Expense" && t.date.toISOString().slice(0,7) === monthKey)
  .reduce((s, t) => s + t.amount, 0);

// Load current month budget on user/transactions change
useEffect(() => {
  const loadBudget = async () => {
    if (!user) return;
    const id = `${user.uid}_${monthKey}`;
    const ref = doc(budgetsCollection, id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as any;
      setBudgetLimit(Number(data.limit) || 0);
      setBudgetInput(String(data.limit ?? ""));
    } else {
      setBudgetLimit(null);
      setBudgetInput("");
    }
  };
  loadBudget();
}, [user, monthKey, transactions]);

const saveBudget = async () => {
  if (!user) return;
  const val = Number(budgetInput);
  if (Number.isNaN(val) || val < 0) return alert("Enter a valid non-negative number.");
  setSavingBudget(true);
  try {
    const id = `${user.uid}_${monthKey}`;
    const ref = doc(budgetsCollection, id);
    await setDoc(ref, {
      userId: user.uid,
      month: monthKey,
      limit: val,
      updatedAt: new Date()
    }, { merge: true });
    setBudgetLimit(val);
  } catch (e) {
    console.error("Saving budget failed", e);
    alert("Could not save budget");
  } finally {
    setSavingBudget(false);
  }
};


  return (
    <Box sx={{ ml: "240px", p: 5 }}>
      <Typography variant="h4" gutterBottom>
        Your Finances: Income & Expenses
      </Typography>

      {/* Summary cards & pie chart */}
      <Box sx={{ display: "flex", gap: 4, mb: 4, flexWrap: "wrap" }}>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="h6">Totals</Typography>
          <Typography>Income Totals:  ${totalIncome.toFixed(2)}</Typography>
          <Typography>Expense Totals: ${totalExpense.toFixed(2)}</Typography>
          <Typography>
            Balance Summation: ${ (totalIncome - totalExpense).toFixed(2) }
          </Typography>
        </Paper>

        {/* Monthly Budget */}
<Paper sx={{ p: 2, flex: 1, minWidth: 260 }}>
  <Typography variant="h6">Monthly Budget</Typography>
  <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
    {monthKey}
  </Typography>

  {budgetLimit == null ? (
    <>
      <Typography variant="body2" sx={{ mb: 1 }}>
        No budget set for this month.
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          size="small"
          label="Set budget ($)"
          value={budgetInput}
          onChange={(e) => setBudgetInput(e.target.value)}
          type="number"
        />
        <Button variant="contained" onClick={saveBudget} disabled={savingBudget || !budgetInput}>
          Save
        </Button>
      </Box>
    </>
  ) : (
    <>
      <Typography>Limit: ${budgetLimit.toFixed(2)}</Typography>
      <Typography>Spent: ${expenseThisMonth.toFixed(2)}</Typography>
      <Typography>
        Remaining: ${Math.max(0, budgetLimit - expenseThisMonth).toFixed(2)}
      </Typography>

      {/* Progress */}
      <Box sx={{ mt: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, (expenseThisMonth / Math.max(1, budgetLimit)) * 100)}
          sx={{
            height: 8,
            borderRadius: 1,
            "& .MuiLinearProgress-bar": {
              bgcolor:
                expenseThisMonth > budgetLimit
                  ? "error.main"
                  : expenseThisMonth >= budgetLimit * 0.9
                  ? "warning.main"
                  : "primary.main",
            },
          }}
        />
      </Box>

      {/* Edit */}
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <TextField
          size="small"
          label="Edit budget ($)"
          value={budgetInput}
          onChange={(e) => setBudgetInput(e.target.value)}
          type="number"
        />
        <Button variant="outlined" onClick={saveBudget} disabled={savingBudget}>
          Update
        </Button>
      </Box>
    </>
  )}
</Paper>

        <Paper sx={{ p: 2, flex: 1, height: 200, minWidth: 200 }}>
          <Typography variant="h6" gutterBottom>
            Income vs Expense Items
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                outerRadius={60}
                label
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Entry form */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            label="Type"
            onChange={e => setType(e.target.value as string)}
          >
            <MenuItem value="Income">Income</MenuItem>
            <MenuItem value="Expense">Expense</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!amount || !type}
          >
            {editingTx ? "Update" : "Add"}
          </Button>
          {editingTx && (
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </Box>
      </Box>

      {/* Transactions table */}
      {loading ? (
        <Typography>Loading transactions…</Typography>
      ) : transactions.length === 0 ? (
        <Typography>No transactions yet.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.date.toLocaleDateString()}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>${tx.amount.toFixed(2)}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(tx)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(tx.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default FinancesPage;