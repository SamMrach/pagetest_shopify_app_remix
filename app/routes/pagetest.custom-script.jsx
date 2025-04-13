import { readFileSync } from "fs";
import { resolve } from "path";

export function loader() {
  // Get the app URL from environment variables
  const appUrl = process.env.SHOPIFY_APP_URL;

  try {
    // Read the script file
    const scriptPath = resolve("app/helpers/custom-script.js");
    let scriptContent = readFileSync(scriptPath, "utf8");

    // Replace environment variable placeholders
    scriptContent = scriptContent.replace(
      "process.env.SHOPIFY_APP_URL",
      appUrl,
    );

    const headers = {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=10800",
      "Access-Control-Allow-Origin": "*",
    };

    // Return the JavaScript content with appropriate headers
    return new globalThis.Response(scriptContent, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving script:", error);
    return new globalThis.Response(
      "console.error('Error loading PageTest script');",
      {
        status: 500,
        headers: {
          "Content-Type": "application/javascript",
        },
      },
    );
  }
}
