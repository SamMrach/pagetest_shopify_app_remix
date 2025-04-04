import React from "react";
import { Box } from "@shopify/polaris";
const LogoContainer = () => {
  return (
    <Box padding="4">
      <img
        src="https://pagetest.ai/wp-content/plugins/PageTest/admin/../assets/pagetest-logo.png"
        alt="PageTest.AI Logo"
        style={{
          width: "80px",
          height: "auto",
          display: "block",
          margin: "0 auto",
        }}
      />
    </Box>
  );
};
export default LogoContainer;
