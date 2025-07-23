import { useEffect } from "react";
import { redirect, RedirectType } from "next/navigation";

export default function Home() {
  redirect("/plan-check", RedirectType.replace);
  return <></>;
}
