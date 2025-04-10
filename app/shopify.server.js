import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  DeliveryMethod,
  LATEST_API_VERSION,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,

  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ admin, session }) => {
      shopify.registerWebhooks({ session });
      // This is your app install handler
      const domain = session.shop;

      // Your custom logic here
      await initShopRecordAfterAuth(domain);
      await injectScriptTag(admin, domain);
      console.log(`Shop ${domain} authenticated successfully`);
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export const apiVersion = LATEST_API_VERSION;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
export default shopify;

const initShopRecordAfterAuth = async (domain) => {
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
    }
  } catch (error) {
    console.error(`Error in auth loader: ${error.message}`);
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
    const scriptUrl = `{process.env.SHOPIFY_APP_URL}/pagetest/custom-script`;

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
