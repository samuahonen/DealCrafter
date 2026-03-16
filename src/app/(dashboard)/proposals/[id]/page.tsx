"use client";

import { useParams } from "next/navigation";
import { ProposalEditor } from "@/components/ProposalEditor";

export default function EditorPage() {
  const params = useParams();
  const id = params.id as string;

  return <ProposalEditor proposalId={id} />;
}
