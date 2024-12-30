import InventorySum from "@/components/InventorySum";
import Overview from "@/components/Overview";
import NavBar from "@/components/NavBar";
import SalesChart from "@/components/Chart";
import InventoryChart from "@/components/ChartInventory";

export default function Dashboard() {
  return (
    <div className="h-screen">
      {" "}
      <NavBar />
      <div className="w-full flex justify-center   px-10 ">
        <div className=" flex flex-wrap justify-center gap-5">
          <div className="flex flex-col ">
            <Overview title={"Summory"} />
            <div>
              <SalesChart />
            </div>
          </div>
          <div className="flex flex-col ">
            <InventorySum title="Inventory"></InventorySum>
            <div>
              <InventoryChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
