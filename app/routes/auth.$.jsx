import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle different auth paths
  if (path.endsWith("/session-token")) {
    // Handle session token requests
    return await authenticate.public.sessionToken(request);
  } else {
    // Default admin authentication for other auth routes
    await authenticate.admin(request);
    return json({});
  }
};

// Also handle POST requests for auth endpoints
export const action = async ({ request }) => {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.endsWith("/session-token")) {
    return await authenticate.public.sessionToken(request);
  }

  return json({});
};
