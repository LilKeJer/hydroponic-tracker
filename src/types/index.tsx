// Definisi tipe untuk meja hidroponik
export interface HydroponicTable {
  id: string;
  name: string;
  description?: string;
  lastHarvest: Date | null;
  lastWaterChange: Date | null;
}

// Tipe untuk props konfirmasi dialog
export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  confirmVariant: "green" | "blue" | "red";
  onConfirm: () => void;
  icon?: React.ReactNode;
}

// Tipe untuk props add table dialog
export interface AddTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (table: Omit<HydroponicTable, "id">) => void;
}

// Tipe untuk props table card
export interface TableCardProps {
  table: HydroponicTable;
  onHarvest: () => void;
  onWaterChange: () => void;
  onDelete: () => void;
}

// Tipe untuk props table card list
export interface TableCardListProps {
  tables: HydroponicTable[];
  onHarvest: (id: string) => void;
  onWaterChange: (id: string) => void;
  onDelete: (id: string) => void;
}
