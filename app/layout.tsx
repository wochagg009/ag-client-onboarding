import type { ReactNode } from "react";

export const metadata = {
  title: "AG Client Onboarding",
  description: "Client onboarding questionnaire",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
