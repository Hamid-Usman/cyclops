export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="flex w-full max-w-sm bg-muted flex-col gap-2 p-5 border-t-2 border-l-2 border-b-4 border-r-4 border-r-primary/40 border-b-primary/50">
            
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
            Sign in to your account to continue.
            </p>
            <div className="flex flex-col gap-4 pt-4">
                <div>
                    <label htmlFor="fullname" className="block text-sm font-medium leading-6 text-gray-900">
                        Full name
                    </label>
                    <input
                        id="fullname"
                        name="fullname"
                        type="text"
                        autoComplete="name"
                        required
                        className="block w-full border border-gray-400 py-1.5 px-2 text-gray-900 outline-0 shadow-sm ring-gray-300 placeholder:text-gray-400  sm:text-sm sm:leading-6"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                        Email address
                    </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="block w-full border border-gray-400 py-1.5 px-2 text-gray-900 outline-0 shadow-sm ring-gray-300 placeholder:text-gray-400  sm:text-sm sm:leading-6"
                        />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                    Password
                    </label>
                    <input
                        name="password" 
                        type="password" 
                        autoComplete="true" 
                        required
                        className="block w-full border border-gray-400 py-1.5 px-2 text-gray-900 outline-0 shadow-sm ring-gray-300 placeholder:text-gray-400  sm:text-sm sm:leading-6"
                    />
                </div>
                <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                    Sign in
                </button>
            </div>
        </div>
            <p>Already have an account? <a href="/auth/signup" className="text-primary hover:underline">Sign up</a></p>
    </div>
  )
}