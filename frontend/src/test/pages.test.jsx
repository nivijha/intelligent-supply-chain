import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: [], count: 0 } }),
    post: vi.fn().mockResolvedValue({ data: { data: [], count: 0 } }),
  },
}));

import { Warehouses } from "../pages/Warehouses";
import { Analytics } from "../pages/Analytics";

describe("Pages", () => {
  it("renders warehouses page", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Warehouses />
        </AuthProvider>
      </BrowserRouter>
    );
    await waitFor(() => expect(screen.getByText(/Warehouse Management/i)).toBeTruthy());
  });

  it("renders analytics page", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Analytics />
        </AuthProvider>
      </BrowserRouter>
    );
    await waitFor(() => expect(screen.getByText(/Reports & Analytics/i)).toBeTruthy());
  });
});
