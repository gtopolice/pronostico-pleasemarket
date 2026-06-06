export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex-1 min-h-0 overflow-x-clip flex flex-col gap-2 sm:gap-4">
      {children}
    </div>
  );
}
