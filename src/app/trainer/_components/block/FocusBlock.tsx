import { WorkoutBlock } from "@prisma/client";
import { on } from "events";
import { CiStickyNote } from "react-icons/ci";
import useSwipe from "~/hooks/useSwipe";
import { hiddenStyles, roundStyles } from "~/utils/blockStyleIncludes";

export const FocusBlock = ({
  block,
  onClose,
  children,
  onPreviousBlock,
  onNextBlock,
}: {
  block: WorkoutBlock;
  onClose: () => void;
  children: React.ReactNode;
  onPreviousBlock?: () => void;
  onNextBlock?: () => void;
}) => {
  const swipeHandlers = useSwipe({
    onSwipedRight: () => {
      onClose();
    },
    onSwipedDown: () => {
      onPreviousBlock?.();
    },
    onSwipedUp: () => {
      onNextBlock?.();
    },
  });

  return (
    <div className="h-screen w-screen p-2 text-base" {...swipeHandlers}>
      <div className="gap-2">
        <div className="text text-xl font-bold">{block.name}</div>

        {block.notes ? (
          <div className="bg-slate-50">
            <CiStickyNote className="relative right-[5px] top-[5px] block text-xs" />
            {block.notes}
          </div>
        ) : null}

        {hiddenStyles.includes(block.style) ? null : <div>{block.style}</div>}

        {roundStyles.includes(block.style) ? (
          <div>{block.rounds} Rounds</div>
        ) : null}

        {block.maxDurationMin ? <div>{block.maxDurationMin} min</div> : null}
      </div>

      <div>{children}</div>
    </div>
  );
};
