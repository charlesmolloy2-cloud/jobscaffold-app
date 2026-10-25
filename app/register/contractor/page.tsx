"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { registerContractor } from "../../../lib/firebase";

const fields = [
  { name: "firstName", label: "First name", autoComplete: "given-name" },
  { name: "lastName", label: "Last name", autoComplete: "family-name" },
  { name: "companyName", label: "Company name", autoComplete: "organization" },
  { name: "email", label: "Email", autoComplete: "email" },
  { name: "password", label: "Password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm password", autoComplete: "new-password" },
] as const;

export default function ContractorRegistration() {
  const router = useRouter();
  const confirmation = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (submitting || !form.reportValidity()) return;

    const data = new FormData(form);
    const details = {
      firstName: String(data.get("firstName")),
      lastName: String(data.get("lastName")),
      companyName: String(data.get("companyName")),
      email: String(data.get("email")),
      password: String(data.get("password")),
      confirmPassword: String(data.get("confirmPassword")),
    };
    if (details.password !== details.confirmPassword) {
      confirmation.current?.setCustomValidity("Passwords must match.");
      confirmation.current?.reportValidity();
      return;
    }

    setSubmitting(true);
    try {
      await registerContractor(details);
      router.push("/settings/profile");
    } catch {
      // Registration error feedback is deferred by PLAN.md.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-start gap-4 p-8 font-sans">
      <h1 className="w-full text-[42px] leading-[normal] font-bold wrap-break-word">
        Register as a Contractor
      </h1>
      <form
        className="flex w-full flex-col items-start gap-4"
        onSubmit={submit}
        onInput={() => confirmation.current?.setCustomValidity("")}
      >
        {fields.map(({ name, label, autoComplete }) => (
          <div key={name} className="flex w-full flex-col items-start gap-2">
            <label htmlFor={name} className="w-full text-lg leading-[22px] font-semibold wrap-break-word">
              {label} *
            </label>
            <input
              ref={name === "confirmPassword" ? confirmation : undefined}
              id={name}
              name={name}
              type={name === "password" || name === "confirmPassword" ? "password" : "text"}
              inputMode={name === "email" ? "email" : undefined}
              autoComplete={autoComplete}
              required
              className="h-12 w-full min-w-0 rounded-none border border-black bg-white px-3 text-lg leading-[normal]"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={submitting}
          className="flex h-[58px] w-full cursor-pointer items-start border border-black bg-white px-3 py-2.5 text-left text-xl leading-[normal] font-semibold wrap-break-word disabled:cursor-wait"
        >
          Create
        </button>
      </form>
    </main>
  );
}
