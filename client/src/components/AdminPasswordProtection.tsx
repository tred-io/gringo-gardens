import React from "react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Lock } from "lucide-react";

interface AdminPasswordProtectionProps {
  onAuthenticate: () => void;
}

export default function AdminPasswordProtection({ onAuthenticate }: AdminPasswordProtectionProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Server-side authentication
      const response = await fetch('/api/admin/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Store authentication in session storage
        sessionStorage.setItem("adminAuthenticated", "true");
        onAuthenticate();
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      console.error("Authentication error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-bluebonnet-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-bluebonnet-900">Admin Access</CardTitle>
          <p className="text-gray-600">Enter the admin password to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                autoFocus
                data-testid="input-admin-password"
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-bluebonnet-600 hover:bg-bluebonnet-700"
              disabled={isLoading || !password.trim()}
              data-testid="button-admin-login"
            >
              {isLoading ? "Authenticating..." : "Access Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}