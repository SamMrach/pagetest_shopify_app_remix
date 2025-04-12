import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
export const loader = async ({ request }) => {
  try {
    await authenticate.admin(request);
  } catch (error) {
    console.error("Authentication failed:", error);
  }
  return redirect("/app");
};
