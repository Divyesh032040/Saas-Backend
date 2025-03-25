// import mongoose from "mongoose";
// import Subscription from "../Model/Subscription";
// import InvoiceMaster from "../model/InvoiceMaster";

// async function generateUserInvoices(userId) {
//   // Fetch all active subscriptions for the user
//   const subscriptions = await Subscription.find({ userId, status: "active" });


//   if (subscriptions.length === 0) {
//     console.log(`No active subscriptions found for user ${userId}`);
//     return;
//   }

//   const invoices = [];

//   for (const subscription of subscriptions) {
//     const { _id, quantity, startDate, endDate , purchasePrice , remainingMonth} = subscription;

//     const start = new Date(startDate);
//     const end = new Date(endDate);
  
//     const yearsDiff = end.getFullYear() - start.getFullYear();
//     const monthsDiff = end.getMonth() - start.getMonth();
  
//     const duration = yearsDiff * 12 + monthsDiff;

//     totalMonth = quantity*duration;

//     // Find the last generated invoice for this subscription
//     const lastInvoice = await InvoiceMaster.findOne({ subscriptionId: _id })
//       .sort({ invoiceDate: -1 })
//       .lean();

//     // Determine the start date for new invoices
//     let invoiceDate = lastInvoice ? new Date(lastInvoice.nextInvoiceDate) : new Date(startDate);
//     invoiceDate.setDate(1); // Always set to the first of the month

//     for (let i = 0; i < quantity; i++) {
//       const dueDate = new Date(invoiceDate);
//       // dueDate.setDate(dueDate.getDate() + 30);  
//       dueDate.setMonth(dueDate.getMonth() + 1);  //Due after 1 month


//       invoices.push({
//         userId,
//         subscriptionId: _id,
//         invoiceDate: new Date(invoiceDate),
//         dueDate: new Date(dueDate),
//         amount: purchasePrice,
//         status: "unpaid",
//         nextInvoiceDate: getNextInvoiceDate(invoiceDate),
//         remainingMonths: lastInvoice ? Math.max(lastInvoice.remainingMonths - 1, 0) : 12,
//       });

//       // Move to the next month's invoice
//       invoiceDate = getNextInvoiceDate(invoiceDate);
//     }
//   }

//   // Insert new invoices only if needed
//   if (invoices.length > 0) {
//     await InvoiceMaster.insertMany(invoices);
//     console.log(`Invoices generated successfully for user ${userId}`);
//   } else {
//     console.log(`No new invoices needed for user ${userId}`);
//   }
// }

// // Function to get the next invoice date (always next month)
// function getNextInvoiceDate(date) {
//   let nextDate = new Date(date);
//   nextDate.setMonth(nextDate.getMonth() + 1);
//   return nextDate;
// }

// // Example usage: Generate invoices for a specific user
// const userId = "USER_OBJECT_ID_HERE"; // Replace with actual user ID
// generateUserInvoices(userId);







import mongoose from "mongoose";
import Subscription from "./models/Subscription";
import InvoiceMaster from "./models/InvoiceMaster";

async function generateUserInvoices(userId) {
  // Fetch the user's active subscriptions
  const subscriptions = await Subscription.find({ userId, status: "active" });

  if (subscriptions.length === 0) {
    console.log(`No active subscriptions found for user ${userId}`);
    return;
  }

  const invoices = [];

  for (const subscription of subscriptions) {
    const { _id, quantity, startDate, endDate, purchasePrice, remainingMonth } = subscription;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate duration in months
    const yearsDiff = end.getFullYear() - start.getFullYear();
    const monthsDiff = end.getMonth() - start.getMonth();
    const duration = yearsDiff * 12 + monthsDiff;

    // Calculate total subscription months
    const totalMonths = quantity * duration;

    // Find the last generated invoice for this subscription
    const lastInvoice = await InvoiceMaster.findOne({ subscriptionId: _id })
      .sort({ invoiceDate: -1 })
      .lean();

    // Determine how many months have already been billed
    const monthsAlreadyBilled = lastInvoice ? totalMonths - lastInvoice.remainingMonths : 0;
    const remainingMonths = totalMonths - monthsAlreadyBilled;

    if (remainingMonths <= 0) {
      console.log(`All invoices already generated for subscription ${_id}`);
      continue;
    }

    // Determine the start date for new invoices
    let invoiceDate = lastInvoice ? new Date(lastInvoice.nextInvoiceDate) : new Date(startDate);
    invoiceDate.setDate(1); // Normalize to the first of the month

    for (let i = 0; i < remainingMonths; i++) {
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getMonth() + 1); // Due after 1 month

      invoices.push({
        userId,
        subscriptionId: _id,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        amount: purchasePrice,
        status: "unpaid",
        nextInvoiceDate: getNextInvoiceDate(invoiceDate),
        remainingMonths: remainingMonths - i - 1,
      });

      // Move to the next month's invoice
      invoiceDate = getNextInvoiceDate(invoiceDate);
    }
  }

  // Insert only missing invoices
  if (invoices.length > 0) {
    await InvoiceMaster.insertMany(invoices);
    console.log(`Invoices generated successfully for user ${userId}`);
  } else {
    console.log(`No new invoices needed for user ${userId}`);
  }
}

// Function to get the next invoice date (always next month)
function getNextInvoiceDate(date) {
  let nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate;
}

// Example usage: Generate invoices for a specific user
const userId = "USER_OBJECT_ID_HERE"; // Replace with actual user ID
generateUserInvoices(userId);

