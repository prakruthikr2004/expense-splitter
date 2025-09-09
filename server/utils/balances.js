/**
* Compute net balances for a group from its expenses.
* Returns an object: { userId: netBalance }, where positive means the user is owed money.
*/
export function computeBalances(expenses, memberIds) {
const net = {};
memberIds.forEach((id) => (net[id.toString()] = 0));


for (const e of expenses) {
const total = e.totalAmount;
const participants = e.participants.map((p) => p.toString());
const share = participants.length > 0 ? total / participants.length : 0;
const payer = e.paidBy.toString();


// Payer paid total
net[payer] = (net[payer] || 0) + total;


// Each participant owes their share
for (const p of participants) {
net[p] = (net[p] || 0) - share;
}
}


return net;
}