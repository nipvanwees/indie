import { BsArrowDown, BsArrowDownRight, BsArrowUp, BsPause } from "react-icons/bs";

export const TempoVisualization = ({
    eccentric = 0,
    isometricBottom = 0,
    concentric = 0,
    isometricTop = 0,
}: {
    eccentric? : number;
    isometricBottom? : number;
    concentric? : number;
    isometricTop? : number;
}) => {
    return (
        <div className="">
            <div className="flex text-[12px] relative font-semibold h-[6px]">
                <span className="w-[10px] flex items-center justify-center"><BsArrowDown />
 </span>
                <span className="w-[10px] flex items-center justify-center border-b"></span>
                <span className="w-[10px] flex items-center justify-center"><BsArrowUp /></span>
                <span className="w-[10px] flex items-center justify-center border-t"></span>
            </div>
            <div className="flex text-[12px] font-medium">
                <span className="w-[10px] flex items-center justify-center">{eccentric ? eccentric : 0}</span>
                <span className="w-[10px] flex items-center justify-center">{isometricBottom ? isometricBottom : 0}</span>
                <span className="w-[10px] flex items-center justify-center">{concentric ? concentric : 0}</span>
                <span className="w-[10px] flex items-center justify-center">{isometricTop ? isometricTop : 0}</span>
            </div>
        </div>
    );
}