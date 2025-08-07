/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState, useEffect} from "react";
import { Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel, Select, MenuItem, Typography, IconButton, } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { financesCollection } from "@utils/firestore";
import { query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@contexts/AuthContext";
import { FirebaseError } from "firebase/app";


/**
 * FinancesPage.tsx
 * 
 * A page to manage income and expenses. React, MUI, for UI components.  
 * - Displays a list of users financial transactions (income/expenses).
 * - Allows user to add a new transaction (amount, type, date).
 * - Fetching and displaying tranasactions from Firestore.
 *  Last updated: 08/06/2025
 */

// Transaction interface
interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: Date;
  description: string;
}

const COLORS = ["#4caf50", "#f44336"]; // green, red

const FinancesPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // load all transactions
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
  }finally{
    setLoading(false);
    }
  };
  
  useEffect(() => {
    loadTransactions();
  }, [user]);

  // compute totals for chart
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

  // save (add or update)
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
  }}};

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setAmount(tx.amount.toString());
    setType(tx.type);
    setDescription(tx.description);
  };

  const handleCancel = () => {
    setEditingTx(null);
    setAmount("");
    setType("");
    setDescription("");
  };

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
    }}};

  return (
    <Box sx={{ ml: "240px", p: 5 }}>
      <Typography variant="h4" gutterBottom>
        Your Finances: Income & Expenses
      </Typography>

      {/* Totals & Pie Chart */}
      <Box sx={{ display: "flex", gap: 4, mb: 4, flexWrap: "wrap" }}>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="h6">Totals</Typography>
          <Typography>Income Totals:  ${totalIncome.toFixed(2)}</Typography>
          <Typography>Expense Totals: ${totalExpense.toFixed(2)}</Typography>
          <Typography>
            Balance Summation: ${ (totalIncome - totalExpense).toFixed(2) }
          </Typography>
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

      {/* Input Form */}
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

      {/* Transactions Table */}
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