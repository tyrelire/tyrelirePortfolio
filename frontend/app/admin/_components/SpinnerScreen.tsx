export function SpinnerScreen() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-4 md:px-10 bg-background flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent" />
    </main>
  );
}
