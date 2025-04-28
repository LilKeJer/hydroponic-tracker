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
import {
  Clover,
  Droplets,
  Trash2,
  Calendar,
  Activity,
  BarChart,
} from "lucide-react";
import ConfirmDialog from "./confirm-dialog";
import { TableCardProps } from "@/types";
import UpdatePhPpmDialog from "./update-ph-ppm-dialog";

// Format tanggal ke format DD-MM-YYYY dan jam HH:MM
function formatDate(date: Date | null | undefined): string {
  if (!date) return "Belum pernah";

  try {
    // Format tanggal DD-MM-YYYY
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    // Format jam HH:MM
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Format tanggal tidak valid";
  }
}

export default function TableCard({
  table,
  onHarvest,
  onWaterChange,
  onDelete,
  onUpdatePhPpm,
}: TableCardProps) {
  const [isHarvestDialogOpen, setIsHarvestDialogOpen] = useState(false);
  const [isWaterDialogOpen, setIsWaterDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPhPpmDialogOpen, setIsPhPpmDialogOpen] = useState(false);

  return (
    <Card className="border-green-100 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg">
              {table?.name || "Meja Hidroponik"}
            </CardTitle>
            {table?.description && (
              <CardDescription>{table.description}</CardDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 h-8 w-8 p-0"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={!table}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {table ? (
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-md overflow-hidden border border-gray-200">
              {/* Header Catatan */}
              <div className="bg-gray-700 px-3 py-2 text-white font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Catatan Aktivitas
              </div>

              <div className="grid grid-cols-2 divide-x divide-gray-300">
                {/* KOLOM CATATAN TERDAHULU */}
                <div className="divide-y divide-gray-200">
                  <div className="bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                    Catatan Terdahulu
                  </div>

                  {/* Panen Terdahulu */}
                  <div className="p-3">
                    <div className="flex items-center mb-1">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                        <Clover className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-green-800">Panen</div>
                        <div className="text-sm text-gray-700">
                          {formatDate(table?.lastHarvest1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ganti Air Terdahulu */}
                  <div className="p-3">
                    <div className="flex items-center mb-1">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <Droplets className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-blue-800">
                          Ganti Air
                        </div>
                        <div className="text-sm text-gray-700">
                          {formatDate(table?.lastWaterChange1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KOLOM CATATAN TERBARU */}
                <div className="divide-y divide-gray-200">
                  <div className="bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                    Catatan Terbaru
                  </div>

                  {/* Panen Terbaru */}
                  <div className="p-3 bg-green-50">
                    <div className="flex items-center mb-1">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                        <Clover className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-green-800">Panen</div>
                        <div className="text-sm text-gray-700">
                          {formatDate(table?.lastHarvest2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ganti Air Terbaru */}
                  <div className="p-3 bg-blue-50">
                    <div className="flex items-center mb-1">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <Droplets className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-blue-800">
                          Ganti Air
                        </div>
                        <div className="text-sm text-gray-700">
                          {formatDate(table?.lastWaterChange2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian PH dan PPM */}
            <div className="rounded-md overflow-hidden border border-yellow-200">
              {/* Header PH dan PPM */}
              <div className="bg-yellow-500 px-3 py-2 text-white font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                PH dan PPM
              </div>
              <div className="grid grid-cols-2 divide-x divide-yellow-200">
                {/* PH */}
                <div className="p-3 bg-yellow-50">
                  <div className="font-medium text-yellow-800 mb-1 flex items-center">
                    <span className="text-xl font-bold text-red-500 mr-1">
                      pH
                    </span>
                    Nilai PH
                  </div>
                  <div className="text-xl font-bold text-center text-red-600 mb-1">
                    {table.phValue !== null
                      ? table.phValue.toFixed(1)
                      : "Belum diukur"}
                  </div>
                  {table.phValue !== null && (
                    <div className="text-xs text-gray-500 text-center">
                      Terakhir diukur:{" "}
                      {table.lastMeasured
                        ? formatDate(table.lastMeasured)
                        : formatDate(new Date())}
                    </div>
                  )}
                </div>

                {/* PPM */}
                <div className="p-3 bg-yellow-50">
                  <div className="font-medium text-yellow-800 mb-1 flex items-center">
                    <BarChart className="h-4 w-4 mr-1" />
                    Nilai PPM
                  </div>
                  <div className="text-xl font-bold text-center text-blue-600 mb-1">
                    {table.ppmValue !== null ? table.ppmValue : "Belum diukur"}
                  </div>
                  {table.ppmValue !== null && (
                    <div className="text-xs text-gray-500 text-center">
                      Terakhir diukur:{" "}
                      {table.lastMeasured
                        ? formatDate(table.lastMeasured)
                        : formatDate(new Date())}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-yellow-100 p-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-200"
                  onClick={() => setIsPhPpmDialogOpen(true)}
                >
                  <Activity className="h-4 w-4 mr-1" /> Update PH & PPM
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            Data meja tidak tersedia
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-3">
        <Button
          variant="outline"
          size="sm"
          className="text-green-600 border-green-200 hover:bg-green-50"
          onClick={() => setIsHarvestDialogOpen(true)}
          disabled={!table}
        >
          <Clover className="h-4 w-4 mr-1" /> Tandai Panen
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={() => setIsWaterDialogOpen(true)}
          disabled={!table}
        >
          <Droplets className="h-4 w-4 mr-1" /> Tandai Ganti Air
        </Button>
      </CardFooter>

      {/* Dialog Konfirmasi Panen */}
      <ConfirmDialog
        open={isHarvestDialogOpen}
        onOpenChange={setIsHarvestDialogOpen}
        title="Tandai Panen"
        description="Apakah Anda yakin ingin menandai meja ini telah dipanen hari ini? Data panen terbaru akan menjadi panen terdahulu, dan panen hari ini akan tercatat sebagai panen terbaru."
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
        description="Apakah Anda yakin ingin menandai meja ini telah diganti airnya hari ini? Data ganti air terbaru akan menjadi ganti air terdahulu, dan ganti air hari ini akan tercatat sebagai ganti air terbaru."
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

      {/* Dialog Update PH dan PPM */}
      {table && (
        <UpdatePhPpmDialog
          open={isPhPpmDialogOpen}
          onOpenChange={setIsPhPpmDialogOpen}
          currentPH={table.phValue}
          currentPPM={table.ppmValue}
          onUpdate={(ph, ppm) => {
            if (onUpdatePhPpm) onUpdatePhPpm(ph, ppm);
          }}
        />
      )}
    </Card>
  );
}
