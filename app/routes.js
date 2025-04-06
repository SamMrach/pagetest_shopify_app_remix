import { flatRoutes } from "@remix-run/fs-routes";

const routes = flatRoutes();
console.log("Registered routes:", Object.keys(routes));
export default routes;
