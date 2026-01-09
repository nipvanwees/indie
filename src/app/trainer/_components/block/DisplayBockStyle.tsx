import type { BlockStyle } from "@prisma/client";
import { BsArrowRepeat } from "react-icons/bs"
import { CiRepeat } from "react-icons/ci"
import { FaAngleDoubleUp } from "react-icons/fa"
import { Badge } from "~/app/_components/ui/badge"

export const DisplayBlockStyle = ({
    style,
    rounds = 0,
    minutes = 0

}: {
    style: BlockStyle,
    rounds?: number,
    minutes?: number

}) => {

    if(style === "TOPDOWN") {
        return (
            null
        )
    }

    if(style === "ROUNDS") {
        return (
            <Badge className="text-sm flex gap-2 items-center">
                <BsArrowRepeat />

            {rounds} rounds
            </Badge>
        )
    }

    if(style === "AMRAP") {
        return (
            <Badge className="text-sm flex gap-2 items-center" color="zinc">
                <FaAngleDoubleUp />

               {minutes} minute AMRAP
            </Badge>
        )
    }

}