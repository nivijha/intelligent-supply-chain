import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { Login } from "../pages/Login";

describe("Login page", () => {
  it("renders sign in form", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    expect(screen.getByText(/Sign In/i)).toBeTruthy();
  });
});
