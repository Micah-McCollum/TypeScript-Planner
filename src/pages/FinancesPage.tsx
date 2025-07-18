import React, {useState, useEffect} from "react";
import { Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel, Select, MenuItem, } from "@mui/material";
import { financesCollection, fetchAllDocuments } from "../utils/firestore"; 
import { addDoc } from "firebase/firestore";

/**
 * FinancesPage.tsx
 * 
 * A page to manage income and expenses. React, MUI, for UI components.  
 * - Displays a list of users financial transactions (income/expenses).
 * - Allows user to add a new transaction (amount, type, date).
 * - Fetching and displaying tranasactions from Firestore.
 *  Last updated: 03/02/2025 
 */

// Transaction interface.
interface Transaction {
  id?: string;
  amount: number;
  type: string;
  date: any;
}

const FinancesPage: React.FC = () => {

  // State for transactions and form inputs
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");

  //TODO: Sorting state
  
  // Fetch all transactions from Firestore on mount.
  useEffect(() => {
    fetchAllDocuments("finances")
    .then((docs) => setTransactions(docs as Transaction[]))
    .catch((error) => console.error("Error fetching documents: ", error));
  }, []);
  
  /**
   * handleAddTransaction
   * Validates input, creates a new transaction object, and adds it to Firestore.
   * @returns {promise<void>} - A promise that resolves when the transaction is added.
   */
  const handleAddTransaction = async () => {
    if (!amount || !type) {
      alert("Please enter an amount and type.");
      return;
    }
    const newTransaction: Transaction = { amount: parseFloat(amount), type, date: new Date() };
    try {
      const docRef = await addDoc(financesCollection, newTransaction);
      newTransaction.id = docRef.id;
      //copies the current transactions and adds the new transaction
      setTransactions((prev) => [...prev, newTransaction]);
      //resets the form inputs
      setAmount("");
      setType("");
    } catch (error) {
      console.error("Error adding transaction: ", error);
    }
  };

  return (
    // Both headers placed in box
    <Box sx={{ marginLeft: "240px", padding: "50px", marginBottom: "160px" }}>
      <h1>Your finances: Income/Expenses </h1>
      <h2>FINANCES...</h2>
  <Box sx={{ display: "flex", gap: "16px", marginBottom: "16px"}}>
      <TextField
        label="Enter Amount"
        variant="outlined"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}     // Updates "amount" state as user types
        type="number"
      />
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel id = "transaction-type-label">Type</InputLabel>
        <Select
          labelId="transaction-type-label"
          id="transaction-type"
          value={type}
          onChange={(e) => setType(e.target.value as string)}    // Updates "type" state as user selects
        >
          <MenuItem value="Income">Income</MenuItem>
          <MenuItem value="Expense">Expense</MenuItem>
        </Select>
      </FormControl>
  
      <Button variant="contained" onClick={handleAddTransaction}>Add Transaction</Button>
    </Box>

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
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.amount}</TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>{transaction.date.toDate().toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
  );
};


export default FinancesPage;
