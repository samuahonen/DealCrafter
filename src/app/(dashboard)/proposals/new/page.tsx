"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProposal, saveProposal } from "@/lib/proposals";

export default function NewProposalPage() {
  const router = useRouter();

  useEffect(() => {
    const p = createProposal();
    saveProposal(p);
    router.replace(`/proposals/${p.id}`);
  }, [router]);

  return null;
}
