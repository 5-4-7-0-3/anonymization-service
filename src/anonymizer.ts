import { faker } from "@faker-js/faker";

const generateRandomString = (length: number): string => {
  return faker.string.alphanumeric(length);
};

export const anonymizeCustomer = (customer: any) => {
  if (!customer || !customer.address) {
    throw new Error("Invalid customer object");
  }

  const randomFirstName = generateRandomString(8);
  const randomLastName = generateRandomString(8);
  const randomEmail = `${generateRandomString(8)}@example.com`;
  const randomAddressLine1 = generateRandomString(8);
  const randomAddressLine2 = generateRandomString(8);
  const randomPostcode = generateRandomString(8);

  return {
    _id: customer._id,
    firstName: randomFirstName,
    lastName: randomLastName,
    email: randomEmail,
    address: {
      line1: randomAddressLine1,
      line2: randomAddressLine2,
      postcode: randomPostcode,
      city: customer.address.city,
      state: customer.address.state,
      country: customer.address.country,
    },
    createdAt: customer.createdAt,
  };
};
