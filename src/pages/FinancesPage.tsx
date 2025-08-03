import React, {useState, useEffect} from "react";
import { Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel, Select, MenuItem, Typography, } from "@mui/material";
import { financesCollection } from "@utils/firestore";
import { query, where, getDocs, addDoc } from "firebase/firestore";
import { useAuth } from "@contexts/AuthContext";


/**
 * FinancesPage.tsx
 * 
 * A page to manage income and expenses. React, MUI, for UI components.  
 * - Displays a list of users financial transactions (income/expenses).
 * - Allows user to add a new transaction (amount, type, date).
 * - Fetching and displaying tranasactions from Firestore.
 *  Last updated: 03/02/2025 
 */

// Transaction interface
interface Transaction {
  id?: string;
  amount: number;
  type: string;
  date: any;
}

const FinancesPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);

  // Load this user's transactions from Firestore
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const loadTransactions = async () => {
      try {
        const q = query(
          financesCollection,
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            amount: data.amount as number,
            type: data.type as string,
            date: (data.date as any).toDate(), // Firestore Timestamp → JS Date
          };
        });
        setTransactions(docs);
      } catch (err) {
        console.error("Error loading transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [user]);

  const handleAddTransaction = async () => {
    if (!user) {
      alert("You must be logged in to add transactions");
      return;
    }
    if (!amount || !type) {
      alert("Please enter both an amount and a type");
      return;
    }

    const newTx = {
      userId: user.uid,
      amount: parseFloat(amount),
      type,
      date: new Date(),
    };

    try {
      const docRef = await addDoc(financesCollection, newTx);
      setTransactions((prev) => [
        ...prev,
        { ...newTx, id: docRef.id },
      ]);
      setAmount("");
      setType("");
    } catch (err) {
      console.error("Error adding transaction:", err);
    }
  };

  return (
    <Box sx={{ marginLeft: "240px", padding: "50px" }}>
      <Typography variant="h4" gutterBottom>
        Your Finances: Income &amp; Expenses
      </Typography>

      {/* Input Form */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 4 }}>
        <TextField
          label="Amount"
          variant="outlined"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel id="transaction-type-label">Type</InputLabel>
          <Select
            labelId="transaction-type-label"
            value={type}
            label="Type"
            onChange={(e) => setType(e.target.value as string)}
          >
            <MenuItem value="Income">Income</MenuItem>
            <MenuItem value="Expense">Expense</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleAddTransaction}
          disabled={!amount || !type}
        >
          Add Transaction
        </Button>
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
                <TableCell>Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>${tx.amount.toFixed(2)}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>
                    {tx.date.toLocaleString()}
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