import { polarClient } from "@/lib/polar";

export async function getCustomerState(userId: string, email: string) {
  let customer;

  // Try lookup by external ID (better-auth user ID)
  try {
    customer = await polarClient.customers.getStateExternal({
      externalId: userId,
    });
  } catch (error) {
    console.warn("Polar external ID lookup failed:", error);
  }

  // Fallback: find customer by email and get their state
  if (!customer) {
    try {
      const customers = await polarClient.customers.list({
        query: email,
      });
      const match = customers.result.items.find(
        (c) => c.email === email
      );
      if (match) {
        customer = await polarClient.customers.getState({ id: match.id });
      }
    } catch (error) {
      console.warn("Polar email lookup failed:", error);
    }
  }

  return customer;
}
