"use client";

import TableCard from "./table-card";
import { TableCardListProps } from "@/types";

export default function TableCardList({
  tables,
  onHarvest,
  onWaterChange,
  onDelete,
}: TableCardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onHarvest={() => onHarvest(table.id)}
          onWaterChange={() => onWaterChange(table.id)}
          onDelete={() => onDelete(table.id)}
        />
      ))}
    </div>
  );
}
