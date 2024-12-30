import Image from "next/image";

export default function OverviewComp({
  title,
  value,
  iconpath,
  rupee,
}: {
  title: string;
  value: string;
  iconpath: string;
  rupee?: string;
}) {
  return (
    <div className="bg-white dark:bg-black py-4  w-22 md:w-44 rounded-lg flex flex-col justify-center items-center">
      <div>
        <Image src={iconpath} alt="img" className="w-8 pb-2 md:w-10 "></Image>
      </div>
      <div className="flex justify-between w-32 md:w-44 gap-5 px-2">
        <div className="text-xs md:text-sm">{title}</div>
        <div className="text-xs md:text-sm">
          <span className="pr-1">{rupee}</span>
          {value}
        </div>
      </div>
    </div>
  );
}
