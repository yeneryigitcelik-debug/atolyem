"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isInbox = pathname?.includes("/inbox");
  const isSent = pathname?.includes("/sent");

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF8F1" }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1 my-8">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-[#1F2937] mb-4">Mesajlarım</h1>
                  
                  {/* Tab Navigation */}
                  <div className="flex gap-4 border-b border-gray-200">
                    <Link
                      href="/messages/inbox"
                      className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                        isInbox
                          ? "text-[#D97706] border-[#D97706]"
                          : "text-gray-600 hover:text-[#D97706] border-transparent hover:border-[#D97706]"
                      }`}
                    >
                      Gelen Kutusu
                    </Link>
                    <Link
                      href="/messages/sent"
                      className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                        isSent
                          ? "text-[#D97706] border-[#D97706]"
                          : "text-gray-600 hover:text-[#D97706] border-transparent hover:border-[#D97706]"
                      }`}
                    >
                      Giden Kutusu
                    </Link>
                  </div>
                </div>
                
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

