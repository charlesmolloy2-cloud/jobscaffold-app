import { render, screen } from "@testing-library/react";
import Home from "../app/page";

describe("Home — Figma frame 230:2", () => {
  it("renders the JobScaffold heading", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: "JobScaffold" }))
      .toBeInTheDocument();
  });

  it("links Register as a Contractor to the documented registration route", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: "Register as a Contractor" }))
      .toHaveAttribute("href", "/register/contractor");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
