import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start gap-4 p-8 font-sans">
      <h1 className="w-full text-[42px] leading-[normal] font-bold wrap-break-word">
        JobScaffold
      </h1>
      <Link
        href="/register/contractor"
        className="flex min-h-[58px] w-full items-start border border-black bg-white px-3 py-2.5 text-left text-xl leading-[normal] font-semibold wrap-break-word"
      >
        Register as a Contractor
      </Link>
    </main>
  );
}
