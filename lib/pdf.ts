import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import OnboardingPdf from "./pdf-document";

export async function generateOnboardingPdf(args: {
  clientName: string;
  submittedAt: string;
  items: { question: string; answer: string }[];
}) {
  const buffer = await renderToBuffer(<OnboardingPdf {...args} />);
  return buffer;
}
