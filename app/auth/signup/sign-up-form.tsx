"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiErrorMessage } from "@/services/api";
import { register } from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";

const inputClass =
  "block w-full rounded-xl border border-border bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white";

export default function SignUpForm() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      signIn(
        await register({
          displayName: String(form.get("fullname")).trim(),
          email: String(form.get("email")),
          password: String(form.get("password")),
        }),
      );
      router.push("/panel");
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't create your account. Please try again."));
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="fullname" className="mb-1.5 block text-sm font-medium text-slate-700">
          Full name
        </label>
        <input
          id="fullname"
          name="fullname"
          type="text"
          autoComplete="name"
          required
          maxLength={80}
          pattern=".*\S.*"
          className={inputClass}
          placeholder="Jane Doe"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={320}
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          className={inputClass}
          placeholder="••••••••"
        />
        <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
