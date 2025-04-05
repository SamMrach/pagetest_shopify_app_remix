import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, admin, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    // First, clean up script tags if admin is available
    if (admin) {
      await removeScriptTags(admin);
    }

    // Then delete session data
    if (session) {
      await db.session.deleteMany({ where: { shop } });
    }

    // Also delete shop data from your custom table
    //await db.shop.deleteMany({ where: { domain: shop } });

    console.log(`Successfully cleaned up data for ${shop}`);
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(`Error handling app uninstalled webhook: ${error.message}`);
    return new Response(null, { status: 500 });
  }
};

// Function to remove all script tags
const removeScriptTags = async (admin) => {
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
    const scriptUrlPattern = "staticsave.com/pagetest/";

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
