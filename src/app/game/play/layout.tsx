export default function GamePlayLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  console.log("GamePlayLayout");
  return (
    <section>
      <h2>WTFFFFFF</h2>
      {children}
    </section>
  );
}
