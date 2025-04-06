import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { redirect } from "@remix-run/node"; // Add this import

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const domain = session.shop;

  try {
    // Check if shop exists
    const shop = await prisma.shop.findUnique({
      where: { domain },
      select: { selections: true },
    });

    if (!shop) {
      // Create new shop record
      await prisma.shop.create({
        data: {
          domain,
          selections: {
            selectedPages: [],
            selectedProducts: [],
          },
        },
      });
      console.log(`Created shop ${domain}`);

      // Optionally inject script tag for new installations
      await injectScriptTag(admin, domain);
    }

    // Return redirect response
    return redirect(`/app?shop=${domain}`);
  } catch (error) {
    console.error(`Error in auth loader: ${error.message}`);
    // Still redirect to app even if there's an error, but log it
    return redirect(`/app?shop=${domain}`);
  }
};

const injectScriptTag = async (admin, shop) => {
  try {
    console.log(`Checking for existing script tags for shop: ${shop}`);

    // First, query existing script tags
    const existingScriptsResponse = await admin.graphql(`
        query {
          scriptTags(first: 250) {
            edges {
              node {
                id
                src
                displayScope
              }
            }
          }
        }
      `);

    const existingScriptsData = await existingScriptsResponse.json();
    const scriptTags = existingScriptsData.data.scriptTags.edges.map(
      (edge) => edge.node,
    );

    // Define your script URL
    const scriptUrl = `${process.env.SHOPIFY_APP_URL}/public/custom-script`;

    // Check if script tag with this URL already exists
    const existingScript = scriptTags.find(
      (script) => script.src === scriptUrl,
    );

    if (existingScript) {
      console.log(`Script tag already exists with ID: ${existingScript.id}`);
      return true;
    }

    // If no existing script found, create a new one
    console.log(
      `No existing script tag found, creating new one for shop: ${shop}`,
    );

    const response = await admin.graphql(
      `
        mutation scriptTagCreate($input: ScriptTagInput!) {
          scriptTagCreate(input: $input) {
            scriptTag {
              id
              src
              displayScope
            }
            userErrors {
              field
              message
            }
          }
        }
        `,
      {
        variables: {
          input: {
            src: scriptUrl,
            displayScope: "ONLINE_STORE",
            cache: false,
          },
        },
      },
    );

    const responseJson = await response.json();

    // Check for errors
    if (responseJson.data.scriptTagCreate.userErrors.length > 0) {
      console.error(
        "Error creating script tag:",
        responseJson.data.scriptTagCreate.userErrors,
      );
      return false;
    }

    console.log(
      "Script tag created successfully:",
      responseJson.data.scriptTagCreate.scriptTag,
    );

    return true;
  } catch (error) {
    console.error("Error injecting script:", error);
    return false;
  }
};
