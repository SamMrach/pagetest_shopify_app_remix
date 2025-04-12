import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  try {
    // Try to authenticate the request
    const { admin, session } = await authenticate.admin(request);

    // If authentication succeeds, user is already logged in
    // Redirect them to the app
    return redirect("/app");
  } catch (error) {
    // If authentication fails, redirect to login
    return redirect("/auth/login");
  }
};
