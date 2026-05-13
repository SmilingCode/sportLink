import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-100 px-4 h-14 flex items-center justify-between">
      <Link href="/" className="text-lg font-medium" style={{ color: "#1D9E75" }}>
        SportLink
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/games/create"
          className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Create game
        </Link>
        <Link
          href="/auth/login"
          className="text-sm px-4 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: "#1D9E75" }}
        >
          Sign in
        </Link>
      </div>
    </nav>
  );
}
