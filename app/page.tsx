import PollCreateForm from "@/app/components/PollCreateForm";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl p-6 md:p-10">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Poll & Voting App</h1>
      <p className="mb-6 text-slate-600">Create a poll, share the link, and watch live results.</p>
      <a href="/dashboard" className="mb-6 inline-block text-sm text-blue-700 underline">
        Open creator dashboard
      </a>
      <PollCreateForm />
    </main>
  );
}
