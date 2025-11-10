"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import { Category } from "@/lib/data";
import { Session } from "next-auth";

interface HeaderWrapperProps {
  categories: Category[];
  session: Session | null;
}

export default function HeaderWrapper({ categories, session }: HeaderWrapperProps) {
  const pathname = usePathname();
  return <Header categories={categories} session={session} pathname={pathname} />;
}

