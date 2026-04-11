export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      {/* Cercles décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 border border-white/5 rounded-full" />
        <div className="absolute top-20 left-20 w-96 h-96 border border-white/5 rounded-full" />
        <div className="absolute bottom-20 right-20 w-48 h-48 border border-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-300 rounded-full opacity-60" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-40" />
      </div>
      <div className="w-full max-w-md relative">
        {children}
      </div>
    </div>
  )
}