import Link from "next/link";
import { useState } from "react";

export const MenuPopup = ({}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {isOpen ? (
        <div className="fixed bottom-0 left-0 flex w-full bg-purple-700 p-2 text-purple-50 hover:bg-purple-800">
          <Link href="/">
            <button
              className="flex-1 rounded bg-purple-800 text-center hover:bg-purple-900"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Home
            </button>
          </Link>
        </div>
      ) : (
        <button
          className="fixed bottom-0 left-0 m-1 flex h-12 w-12 items-center justify-center rounded-full bg-purple-700 p-2 text-purple-50 hover:bg-purple-800"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          Menu
        </button>
      )}
    </div>
  );
};
