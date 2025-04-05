import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.webhook(request);

  // Get the shop from the session
  const shop = session.shop;

  try {
    console.log(`App installed on shop: ${shop}`);

    // Create a script tag for the shop
    const scriptUrl = `https://static.staticsave.com/pagetest/custom-snippet-j.js`;

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
            displayScope: "ONLINE_STORE", // Can be ALL, ONLINE_STORE, ORDER_STATUS
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
      return new Response(null, { status: 200 });
    }

    // Store the script tag ID in the database for future reference
    // await prisma.storeSettings.upsert({
    //   where: { shop },
    //   update: {
    //     scriptTagId: responseJson.data.scriptTagCreate.scriptTag.id,
    //   },
    //   create: {
    //     shop,
    //     scriptTagId: responseJson.data.scriptTagCreate.scriptTag.id,
    //     selectedPages: "[]",
    //     selectedProducts: "[]",
    //   },
    // });

    console.log(
      "Script tag created successfully:",
      responseJson.data.scriptTagCreate.scriptTag,
    );

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Error handling APP_INSTALLED webhook:", error);
    return new Response(null, { status: 500 });
  }
};
