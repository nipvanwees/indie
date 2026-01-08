import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Navbar, NavbarItem } from "./_components/ui/navbar";
import { FaHouse } from "react-icons/fa6";

import { StackedLayout } from "./_components/ui/stacked-layout";
import { SideBar } from "./_components/stacked-layout";

export const metadata: Metadata = {
  title: "Indie Movement",
  description: "Athelete and Trainer platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});



const NavBar = () => {
  // const { data: session } = useSession();
  // const router = useRouter();

  // const handleSignOut = async () => {
  //   await signOut();
  //   router.push("/auth/login");
  // };

  return (
    <Navbar>
      <NavbarItem href="/" className="text-2xl font-bold">
        <FaHouse />
      </NavbarItem>
      {/* {session && (
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {session.user.name}
          </span>
          <Button onClick={handleSignOut} outline>
            Sign out
          </Button>
        </div>
      )} */}
    </Navbar>
  );
};


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
      <StackedLayout navbar={<NavBar />} sidebar={<SideBar />}>
        <TRPCReactProvider>
          {children}
          </TRPCReactProvider>
          </StackedLayout>
      </body>
    </html>
  );
}
