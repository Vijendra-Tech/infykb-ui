

export default function Home() {
  return (
    <main className="flex-1 overflow-auto p-8">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to InfinityKB</h1>
        <p className="text-xl text-muted-foreground">
          Your intelligent knowledge base assistant
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="border rounded-lg p-6 text-left hover:border-primary transition-colors">
            <h2 className="text-2xl font-semibold mb-2">Knowledge Base</h2>
            <p className="text-muted-foreground">Access and manage your organization's knowledge base</p>
          </div>
          <div className="border rounded-lg p-6 text-left hover:border-primary transition-colors">
            <h2 className="text-2xl font-semibold mb-2">AI Assistant</h2>
            <p className="text-muted-foreground">Get intelligent answers to your questions</p>
          </div>
        </div>
      </div>
    </main>
  );
}
