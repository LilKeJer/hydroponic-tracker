"use client";

import TableCard from "./table-card";
import { TableCardListProps } from "@/types";

export default function TableCardList({
  tables,
  onHarvest,
  onWaterChange,
  onDelete,
  onUpdatePhPpm,
  onAddNutrient,
  onResetNutrient,
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
          onUpdatePhPpm={
            onUpdatePhPpm
              ? (ph, ppm) => onUpdatePhPpm(table.id, ph, ppm)
              : undefined
          }
          onAddNutrient={
            onAddNutrient
              ? (id, amount) => onAddNutrient(id, amount) // Fix: pass id directly instead of wrapping
              : undefined
          }
          onResetNutrient={
            onResetNutrient ? () => onResetNutrient(table.id) : undefined
          }
        />
      ))}
    </div>
  );
}
