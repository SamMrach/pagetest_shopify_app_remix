import { redirect } from "@remix-run/node";

import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  return redirect("/auth/login");
};
