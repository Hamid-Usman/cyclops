import GoogleSignInButton from "../google-sign-in-button";
import SignUpForm from "./sign-up-form";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-md border-2 border-b-4 border-r-4 border-b-primary/40 border-r-primary/40 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
            C
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Cyclops</p>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-600">Start managing your work in one place.</p>
        </div>

        <SignUpForm />

        <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <GoogleSignInButton />

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <a href="/auth/signin" className="font-medium text-primary/80 hover:text-primary">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
