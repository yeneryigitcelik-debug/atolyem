/**
 * Auth error page - displayed when authentication fails.
 */

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="mt-2 text-gray-600">
          Something went wrong during authentication. Please try again.
        </p>
        <a
          href="/"
          className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

