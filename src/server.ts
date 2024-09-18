import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import Customer from "./models/customer.model";
import CustomerAnonymised from "./models/customerAnonymised.model";
import { anonymizeCustomer } from "./anonymizer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.DB_URI!);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

function generateCustomer() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    address: {
      line1: faker.location.streetAddress(),
      line2: faker.location.secondaryAddress(),
      postcode: faker.location.zipCode(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
    },
    createdAt: new Date(),
  };
}

async function saveGeneratedCustomer() {
  const customer = generateCustomer();
  try {
    await Customer.create(customer);
  } catch (err) {
    console.error("Error saving customer:", err);
  }
}

setInterval(saveGeneratedCustomer, 200);

function watchCustomerChanges() {
  const changeStream = Customer.watch();

  changeStream.on("change", async (change) => {
    if (
      change.operationType === "insert" ||
      change.operationType === "update"
    ) {
      const customer = change.fullDocument;
      const anonymisedCustomer = anonymizeCustomer(customer);

      try {
        await CustomerAnonymised.findOneAndUpdate(
          { _id: customer._id },
          anonymisedCustomer,
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error("Error updating anonymised customer:", err);
      }
    }
  });
}

async function startServer() {
  await connectToDatabase();
  watchCustomerChanges();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
