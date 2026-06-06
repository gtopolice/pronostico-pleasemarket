export function Spacer({ size = 16 }: { size?: number }) {
  return (
    <div
      className="w-full min-w-full"
      style={{ height: `${size}px` }}
    />
  );
}
