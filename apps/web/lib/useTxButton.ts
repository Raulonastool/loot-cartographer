import { useEffect } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

type WriteRequest = Parameters<ReturnType<typeof useWriteContract>["writeContract"]>[0];

export interface TxButton {
  send: () => void;
  isPending: boolean;
  label: string;
  error: Error | null;
  isMined: boolean;
}

export function useTxButton({
  request,
  idleLabel,
  onMined,
}: {
  request: WriteRequest;
  idleLabel: string;
  onMined?: () => void;
}): TxButton {
  const { writeContract, data: hash, isPending: signing, error } = useWriteContract();
  const { isLoading: mining, isSuccess: isMined } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isMined) onMined?.();
  }, [isMined, onMined]);

  return {
    send: () => writeContract(request),
    isPending: signing || mining,
    label: signing ? "signing…" : mining ? "confirming…" : idleLabel,
    error,
    isMined,
  };
}
