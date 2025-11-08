'use client';

export default function Home() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || 'local';
  const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA || 'dev';

  // Format build time to user's local timezone (runs in browser)
  const formatBuildTime = () => {
    if (buildTime === 'local') return 'Local Build';
    
    const date = new Date(buildTime);
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">Hello World COP30</h1>
        <p className="text-xl text-gray-600">
          Welcome to the Role Directory Application
        </p>
      </main>
      
      {/* Version info anchor - bottom right corner */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-200">
        <div className="font-mono space-y-0.5">
          <div className="font-semibold text-gray-700">v{version}</div>
          <div className="text-[10px] text-gray-500">
            {formatBuildTime()}
          </div>
          <div className="text-[10px] text-gray-500">
            SHA: {commitSha.substring(0, 7)}
          </div>
        </div>
      </div>
    </div>
  );
}

