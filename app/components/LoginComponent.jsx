"use client";
import React, { useState, useCallback } from "react";
import {
  AppProvider,
  Page,
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  Link,
  Box,
  Text,
  InlineStack,
} from "@shopify/polaris";
//import { LogoContainer } from "../../components/LogoContainer ";
import { login } from "../helpers/utils";

const LoginComponent = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleEmailChange = useCallback((value) => setEmail(value), []);
  const handlePasswordChange = useCallback((value) => setPassword(value), []);

  const handleSubmit = useCallback(async () => {
    // Validate inputs
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      // Make API call to your authentication endpoint
      //const response = await login(email, password);
      const response = {
        success: true,
        token: "your_token_here",
      };
      if (!response.success) {
        setErrorMessage("Invalid email or password");
        return;
      }
      onLogin(response.token);
    } catch (err) {
      setErrorMessage(err.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [email, password]);

  return (
    <Page>
      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
        <div
          style={{ display: "flex", justifyContent: "center", padding: "20px" }}
        >
          {/* <LogoContainer /> */}
        </div>

        <Card>
          {errorMessage && (
            <Box padding="4">
              <Banner status="critical">{errorMessage}</Banner>
            </Box>
          )}

          <Box padding="4">
            <FormLayout>
              <TextField
                value={email}
                onChange={handleEmailChange}
                label="Email"
                type="email"
              />

              <TextField
                value={password}
                onChange={handlePasswordChange}
                label="Password"
                type="password"
              />

              <Button
                variant="primary"
                size="large"
                loading={isLoading}
                onClick={handleSubmit}
              >
                Sign in
              </Button>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <Link url="https://app.pagetest.ai/forgot-password" external>
                  Forgot the password?
                </Link>
              </div>

              <div style={{ textAlign: "center" }}>
                <Text>Don&apos;t have an account yet?</Text>
                <Link url="https://pagetest.ai/" external>
                  {" "}
                  Register here
                </Link>
              </div>
            </FormLayout>
          </Box>
        </Card>
      </div>
    </Page>
  );
};

export default LoginComponent;
