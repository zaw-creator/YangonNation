import './globals.css';

export const metadata = {
  title:       'Yangon Nation — AutoCult',
  description: "Yangon's premier car community. Join the movement.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
