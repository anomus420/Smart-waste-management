const Loader = ({ fullPage = false, size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  const spinner = (
    <div className={`animate-spin rounded-full border-2 border-green-200 border-t-green-600 ${sizes[size]}`} />
  )
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full border-4 border-green-100 border-t-green-600 h-12 w-12" />
          <p className="text-green-700 font-medium text-sm">Loading...</p>
        </div>
      </div>
    )
  }
  return spinner
}

export default Loader