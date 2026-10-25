import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ContractorRegistration from "../app/register/contractor/page";
import { registerContractor } from "../lib/firebase";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("../lib/firebase", () => ({ registerContractor: jest.fn() }));

const details = {
  firstName: "Jane", lastName: "Builder", companyName: "Builder Co",
  email: "jane@example.com", password: "password123", confirmPassword: "password123",
};
const fields = [
  ["First name", "firstName"], ["Last name", "lastName"],
  ["Company name", "companyName"], ["Email", "email"],
  ["Password", "password"], ["Confirm password", "confirmPassword"],
] as const;

function fillForm(overrides: Partial<typeof details> = {}) {
  const values = { ...details, ...overrides };
  for (const [label, key] of fields) {
    fireEvent.input(screen.getByLabelText(`${label} *`), { target: { value: values[key] } });
  }
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(registerContractor).mockResolvedValue(undefined);
});

test("renders the six required Figma fields and Create button", () => {
  render(<ContractorRegistration />);
  expect(screen.getByRole("heading", { level: 1, name: "Register as a Contractor" })).toBeVisible();
  for (const [label] of fields) expect(screen.getByLabelText(`${label} *`)).toBeRequired();
  expect(screen.getByLabelText("Password *")).toHaveAttribute("type", "password");
  expect(screen.getByLabelText("Confirm password *")).toHaveAttribute("type", "password");
  expect(screen.getByRole("button", { name: "Create" })).toHaveAttribute("type", "submit");
});

test.each(fields)("requires %s before registering", (label) => {
  render(<ContractorRegistration />);
  fillForm();
  fireEvent.input(screen.getByLabelText(`${label} *`), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "Create" }));
  expect(registerContractor).not.toHaveBeenCalled();
  expect(push).not.toHaveBeenCalled();
});

test("requires matching passwords and allows correcting the confirmation", async () => {
  render(<ContractorRegistration />);
  fillForm({ confirmPassword: "different" });
  fireEvent.click(screen.getByRole("button", { name: "Create" }));
  expect(screen.getByLabelText("Confirm password *")).toBeInvalid();
  expect(registerContractor).not.toHaveBeenCalled();
  fireEvent.input(screen.getByLabelText("Confirm password *"), { target: { value: details.password } });
  fireEvent.click(screen.getByRole("button", { name: "Create" }));
  await waitFor(() => expect(push).toHaveBeenCalledWith("/settings/profile"));
});

test("waits for registration and login before navigating to the profile", async () => {
  let finish!: () => void;
  jest.mocked(registerContractor).mockReturnValue(new Promise<void>((resolve) => { finish = resolve; }));
  render(<ContractorRegistration />);
  fillForm();
  fireEvent.click(screen.getByRole("button", { name: "Create" }));
  expect(registerContractor).toHaveBeenCalledWith(details);
  expect(push).not.toHaveBeenCalled();
  finish();
  await waitFor(() => expect(push).toHaveBeenCalledWith("/settings/profile"));
});
