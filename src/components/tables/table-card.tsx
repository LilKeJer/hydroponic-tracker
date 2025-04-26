"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clover, Droplets, Trash2 } from "lucide-react";
import ConfirmDialog from "./confirm-dialog";
import { TableCardProps } from "@/types";

// Format tanggal ke format Indonesia
function formatDate(date: Date | null): string {
  if (!date) return "Belum pernah";

  // Format tanggal DD-MM-YYYY
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  // Format jam HH:MM
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `Tanggal: ${day}-${month}-${year} jam: ${hours}:${minutes}`;
}

export default function TableCard({
  table,
  onHarvest,
  onWaterChange,
  onDelete,
}: TableCardProps) {
  const [isHarvestDialogOpen, setIsHarvestDialogOpen] = useState(false);
  const [isWaterDialogOpen, setIsWaterDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <Card className="border-green-100 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg">{table.name}</CardTitle>
            {table.description && (
              <CardDescription>{table.description}</CardDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 h-8 w-8 p-0"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="flex items-center mb-2">
          <Clover className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
          <span>
            <span className="font-medium">Terakhir panen:</span>{" "}
            {formatDate(table.lastHarvest)}
          </span>
        </div>
        <div className="flex items-center">
          <Droplets className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
          <span>
            <span className="font-medium">Terakhir ganti air:</span>{" "}
            {formatDate(table.lastWaterChange)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          className="text-green-600 border-green-200"
          onClick={() => setIsHarvestDialogOpen(true)}
        >
          <Clover className="h-4 w-4 mr-1" /> Panen
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-200"
          onClick={() => setIsWaterDialogOpen(true)}
        >
          <Droplets className="h-4 w-4 mr-1" /> Ganti Air
        </Button>
      </CardFooter>

      {/* Dialog Konfirmasi Panen */}
      <ConfirmDialog
        open={isHarvestDialogOpen}
        onOpenChange={setIsHarvestDialogOpen}
        title="Tandai Panen"
        description="Apakah Anda yakin ingin menandai meja ini telah dipanen hari ini?"
        confirmText="Tandai Panen"
        confirmVariant="green"
        onConfirm={onHarvest}
        icon={<Clover className="h-5 w-5 text-green-600" />}
      />

      {/* Dialog Konfirmasi Ganti Air */}
      <ConfirmDialog
        open={isWaterDialogOpen}
        onOpenChange={setIsWaterDialogOpen}
        title="Tandai Ganti Air"
        description="Apakah Anda yakin ingin menandai meja ini telah diganti airnya hari ini?"
        confirmText="Tandai Ganti Air"
        confirmVariant="blue"
        onConfirm={onWaterChange}
        icon={<Droplets className="h-5 w-5 text-blue-600" />}
      />

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Hapus Meja"
        description="Apakah Anda yakin ingin menghapus meja ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        confirmVariant="red"
        onConfirm={onDelete}
        icon={<Trash2 className="h-5 w-5 text-red-600" />}
      />
    </Card>
  );
}
