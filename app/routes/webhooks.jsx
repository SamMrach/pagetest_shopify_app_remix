import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, admin, session, topic } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      try {
        // First check if admin is available before trying to use it
        if (admin) {
          try {
            await removeScriptTags(admin);
          } catch (error) {
            console.error(`Error removing script tags: ${error.message}`);
            // Continue with cleanup even if script tag removal fails
          }
        } else {
          console.log(
            "Admin API not available - app likely already uninstalled",
          );
        }

        // Clean up session data regardless of admin availability
        await db.session.deleteMany({ where: { shop } });

        // Also delete shop data from your custom table
        //await db.shop.deleteMany({ where: { domain: shop } });
      } catch (error) {
        console.error(
          `Error handling app uninstalled webhook: ${error.message}`,
        );
      }
      break;

    default:
      console.log(`Unhandled webhook topic: ${topic}`);
      break;
  }

  // Always return a 200 response to acknowledge receipt of the webhook
  return new Response(null, { status: 200 });
};

// Function to remove all script tags
const removeScriptTags = async (admin) => {
  if (!admin) {
    throw new Error("Admin API client not available");
  }

  try {
    // First, query existing script tags
    const existingScriptsResponse = await admin.graphql(`
      query {
        scriptTags(first: 250) {
          edges {
            node {
              id
              src
            }
          }
        }
      }
    `);

    const existingScriptsData = await existingScriptsResponse.json();
    const scriptTags = existingScriptsData.data.scriptTags.edges.map(
      (edge) => edge.node,
    );

    // Define your script URL pattern to match
    const scriptUrlPattern = "pagetest/custom-script";

    // Filter script tags that match your pattern
    const appScriptTags = scriptTags.filter((script) =>
      script.src.includes(scriptUrlPattern),
    );

    console.log(`Found ${appScriptTags.length} script tags to remove`);

    // Delete each script tag
    for (const script of appScriptTags) {
      await admin.graphql(`
        mutation {
          scriptTagDelete(id: "${script.id}") {
            deletedScriptTagId
            userErrors {
              field
              message
            }
          }
        }
      `);
      console.log(`Deleted script tag with ID: ${script.id}`);
    }

    return true;
  } catch (error) {
    console.error("Error removing script tags:", error);
    return false;
  }
};
