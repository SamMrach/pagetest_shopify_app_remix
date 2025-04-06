import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { Form, useActionData, useSubmit } from "@remix-run/react";
import { Page, Button, Banner } from "@shopify/polaris";

export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const domain = session.shop;

  try {
    // Delete existing shop record to simulate a fresh install
    // await prisma.shop.deleteMany({
    //   where: { domain },
    // });

    // Now run the same logic as in auth.$.jsx
    const shop = await prisma.shop.findUnique({
      where: { domain },
      select: { selections: true },
    });

    if (!shop) {
      await prisma.shop.create({
        data: {
          domain,
          selections: {
            selectedPages: [],
            selectedProducts: [],
          },
        },
      });

      // Call the script tag injection function
      const scriptTagResult = await injectScriptTag(admin, domain);

      return json({
        success: true,
        message: `Created shop ${domain} and injected script tag: ${scriptTagResult}`,
      });
    }

    return json({ success: false, message: "Shop already exists" });
  } catch (error) {
    console.error(`Error in test auth: ${error.message}`);
    return json({ success: false, error: error.message });
  }
}

// Copy the injectScriptTag function from auth.$.jsx
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

export default function TestAuth() {
  const actionData = useActionData();
  const submit = useSubmit();

  return (
    <Page title="Test Auth Flow">
      {actionData && (
        <Banner
          status={actionData.success ? "success" : "critical"}
          title={actionData.success ? "Success" : "Error"}
        >
          <p>{actionData.message || actionData.error}</p>
        </Banner>
      )}

      <Button primary onClick={() => submit({}, { method: "post" })}>
        Simulate App Install
      </Button>
    </Page>
  );
}
