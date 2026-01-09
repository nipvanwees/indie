"use client"

import moment, { type Moment } from "moment";
import { useEffect, useMemo, useState } from "react";
import { BsArrowLeft, BsArrowRight, BsCalendarCheckFill } from "react-icons/bs";
import { Button } from "~/app/_components/ui/button";
import { Dialog } from "~/app/_components/ui/dialog";
import { WorkoutPlanningListDisplay } from "./workout/WorkoutListDisplay";
import { CreateWorkout } from "./workout/CreateWorkout";
import type { Locations, Workout, WorkoutPlanning } from "@prisma/client";

import type { PersonalWorkoutPlanningOutput } from "~/utils/trpc-types";

declare global {
  interface Date {
    addDays(days: number): Date;
  }
}
Date.prototype.addDays = function (days: number) {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

function getDates(startDate: Date, stopDate: Date) {
  const dateArray = [];
  let currentDate: Date = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(new Date(currentDate));
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
}

const isSameDate = (a: Date, b: Date) => {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
};

const HorizontalCalendar = ({
  workoutPlannings
}: {
  workoutPlannings: PersonalWorkoutPlanningOutput;
}) => {
  const [dates, setDates] = useState<Date[]>([]);

  const [createOpen, setCreateOpen] = useState(false);

  const [highlightedDate, setHighlightedDate] = useState<Date>(
    new Date(new Date().toISOString()),
  );

  const highlightedMoment = useMemo<Moment>(() => {
    return moment(highlightedDate);
  }, [highlightedDate]);

  const eventsOnDate = (date: Date) => {
    return workoutPlannings.filter((planning) => {
      return planning.date && isSameDate(planning.date, date);
    });
  };

  const eventsOnHighlightedDate = useMemo(() => {
    return eventsOnDate(highlightedDate);
  }, [highlightedDate, workoutPlannings]);

  useEffect(() => {
    // Perform localStorage action
    const setDate = new Date(
      localStorage.getItem("selectedDateSetAt") ?? new Date(),
    );

    const minutesAgo = (new Date().valueOf() - setDate.valueOf()) / 1000 / 60;
    const longAgo = minutesAgo > 5;

    if (longAgo) {
      localStorage.removeItem("selectedDate");
      localStorage.removeItem("selectedDateSetAt");
    }

    const date = longAgo
      ? new Date()
      : new Date(localStorage.getItem("selectedDate") || new Date());
    setHighlightedDate(date);

    // const today = new Date();
    const dates = getDates(date.addDays(-7), date.addDays(7));
    setDates(dates);

    setTimeout(() => {
      const highlightedEl = document.getElementById(
        date.toLocaleDateString().split(",")[0] || "",
      );
      if (highlightedEl)
        highlightedEl.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "center",
        });
    }, 100);
  }, []);

  const scrollToMiddle = () => {
    const todayId = new Date().toLocaleDateString().split(",")[0] || "";
    document.getElementById(todayId)?.scrollIntoView({
      behavior: "auto",
      inline: "center",
      block: "center",
    });
  };

  const goForwardMore = () => {
    const highest = dates[dates.length - 1] || new Date();
    const news = getDates(highest.addDays(1), highest.addDays(7));
    setDates([...dates, ...news]);
  };

  const goBackMore = () => {
    const lowest = dates[0] || new Date();
    const news = getDates(lowest.addDays(-7), lowest.addDays(-1));
    setDates([...news, ...dates]);
  };

  const clickDate = (el: HTMLDivElement, date: Date) => {
    // store date in localstorage
    localStorage.setItem("selectedDate", date.toISOString());
    localStorage.setItem("selectedDateSetAt", new Date().toISOString());
    el.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "center",
    });
  };

  // const ActivityBlock = ({ activity }: { activity: Activities }) => {
  //   return (
  //     <Link href={`/${activity.type.toLowerCase()}/${activity.id}`}>
  //       <div className="mb-2 flex items-center gap-2">
  //         <div
  //           className={`flex h-9 w-9 items-center justify-center rounded-full text-xl ${getTypeColor(
  //             activity.type,
  //           )}`}
  //         >
  //           {activity.type === "Notes" && <NotebookIcon className="inline" />}
  //           {activity.type === "Workout" && <WorkoutIcon className="inline" />}
  //         </div>
  //         <div>{activity.name}</div>
  //       </div>
  //     </Link>
  //   );
  // };

  return (
    <div className="text-black">
      <div className="no-scrollbar max-h-14 max-w-[100%] overflow-x-scroll bg-slate-200 whitespace-nowrap">
        <div className="inline-block h-14 max-h-14 w-14 max-w-14 overflow-hidden">
          <button
            className="inline-block h-14 max-h-14 w-14 max-w-14 items-center justify-center text-sm"
            onClick={() => goBackMore()}
          >
            <BsArrowLeft className="inline" />
          </button>
        </div>

        {dates.map((day) => {
          return (
            <div
              key={day.toISOString()}
              className={`inline-block h-14 max-h-14 w-14 max-w-14 overflow-hidden ${isSameDate(day, new Date()) ? "border-b-2 border-b-blue-600" : ""} `}
            >
              <div
                onClick={(e) => {
                  setHighlightedDate(day);
                  clickDate(e.currentTarget, day);
                }}
                id={day.toLocaleString().split(",")[0]}
                className={` ${
                  isSameDate(day, highlightedDate) ? "bg-slate-500/20" : ""
                } no-scrollbar inline-block h-14 max-h-14 w-14 max-w-14 cursor-pointer rounded-full text-center`}
              >
                <div className="font-slate-700 flex h-full w-full items-center justify-center text-sm">
                  <div
                    className={`rounded-full" flex h-[30px] w-[30px] items-center justify-center`}
                  >
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full">
                      {day.getDate()}
                      {eventsOnDate(day)?.length > 0 && (
                        <span className="absolute top-[25px] flex gap-[0.5px]">
                          {eventsOnDate(day).map((i, index) => (
                            <div
                              className={`h-[6px] w-[6px] rounded-full ${i.workout?.completed ? "bg-green-600" : "bg-red-600"}`}
                              key={i.id + index + "subItem"}
                            ></div>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {day.getDate() === 1 ? (
                  <div className="relative bottom-[60px] text-center text-xs text-black/50 lowercase">
                    {
                      // display current month of date object
                      day.toLocaleString("default", { month: "long" })
                    }
                  </div>
                ) : (
                  <div className="relative bottom-[55px] text-center text-[10px] text-black/30 lowercase">
                    {
                      // display current month of date object
                      day.toLocaleString("default", { weekday: "short" })
                    }
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div className="inline-block h-14 max-h-14 w-14 max-w-14 overflow-hidden">
          <button
            className="inline-block h-14 max-h-14 w-14 max-w-14 items-center justify-center text-sm"
            onClick={() => goForwardMore()}
          >
            <BsArrowRight className="inline" />
          </button>
        </div>
      </div>
      <div className="mt-6  bg-slate-200 p-2 pt-4">
        <div className="flex w-full justify-between">
          <span className="z-0 translate-x-1 translate-y-[-28px] rounded-tl-lg rounded-tr-lg bg-slate-200 px-2 pt-1 text-slate-700">
            {highlightedMoment.calendar().split(" ")[0] === "Last"
              ? highlightedMoment.calendar().split(" ").splice(0, 2).join(" ")
              : highlightedMoment.calendar().split(" ").splice(0, 1).join(" ")}
          </span>
          <span className="z-0 translate-y-[-28px] rounded-tl-lg rounded-tr-lg bg-slate-200 px-2 pt-1 text-slate-700">
            <button
              onClick={() => {
                setHighlightedDate(new Date());
                scrollToMiddle();
              }}
              className="flex items-center justify-center"
            >
              <BsCalendarCheckFill className="inline" />
            </button>
          </span>
        </div>

        {eventsOnHighlightedDate && eventsOnHighlightedDate.length > 0 ? (
          eventsOnHighlightedDate
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((i) => <div key={i.id}>{i.workout?.name}</div>)
            // .map((i) => <WorkoutPlanningListDisplay key={i.id} workout={i.workout} />)
        ) : (
          <div>
            No events <br />
          </div>
        )}

        <Button
          outline
          onClick={() => setCreateOpen(true)}
        >
          Create workout
        </Button>

        <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
          <CreateWorkout defaultDate={highlightedDate} />
        </Dialog>

        <div className="pt-2"></div>
      </div>
    </div>
  );
};

export default HorizontalCalendar;



