const BASE_URL = "http://localhost:5000/api";

export const getTransactions = async () => {
  const res = await fetch(`${BASE_URL}/transactions`);
  return res.json();
};

export const addTransaction = async (transaction) => {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
  return res.json();
};
