import { redirect } from "@remix-run/node";

import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  return redirect("/auth/login");
};
