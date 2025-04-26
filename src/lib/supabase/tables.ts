import { supabase } from "./client";
import { HydroponicTable } from "@/types";
import { getCurrentUser } from "./auth";

// Mengambil semua meja hidroponik milik user
export async function getTables(): Promise<HydroponicTable[]> {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("User tidak terautentikasi");
  }

  const { data, error } = await supabase
    .from("hydroponic_tables")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Gagal mengambil data meja");
  }

  // Filter tables by user_id manually if needed
  const userTables = data
    ? data.filter((table) => table.user_id === user.id)
    : [];

  // Konversi string dates menjadi Date objects
  return userTables.map((table) => ({
    id: table.id,
    name: table.name,
    description: table.description,
    lastHarvest: table.last_harvest_at ? new Date(table.last_harvest_at) : null,
    lastWaterChange: table.last_water_change_at
      ? new Date(table.last_water_change_at)
      : null,
  })) as HydroponicTable[];
}

// Menambah meja hidroponik baru
export async function addTable(
  tableData: Omit<HydroponicTable, "id">
): Promise<HydroponicTable> {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("User tidak terautentikasi");
  }

  const newTableData = {
    name: tableData.name,
    description: tableData.description || null,
    user_id: user.id,
    last_harvest_at: tableData.lastHarvest
      ? tableData.lastHarvest.toISOString()
      : null,
    last_water_change_at: tableData.lastWaterChange
      ? tableData.lastWaterChange.toISOString()
      : null,
  };

  const { data, error } = await supabase
    .from("hydroponic_tables")
    .insert([newTableData])
    .select()
    .single();

  if (error) {
    throw new Error("Gagal menambahkan meja");
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    lastHarvest: data.last_harvest_at ? new Date(data.last_harvest_at) : null,
    lastWaterChange: data.last_water_change_at
      ? new Date(data.last_water_change_at)
      : null,
  };
}

// Update status panen
export async function updateHarvest(tableId: string): Promise<void> {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("User tidak terautentikasi");
  }

  const now = new Date().toISOString();

  // Update meja
  const { error: tableError } = await supabase
    .from("hydroponic_tables")
    .update({ last_harvest_at: now })
    .eq("id", tableId);

  if (tableError) {
    throw new Error("Gagal update status panen");
  }

  // Catat event
  const { error: eventError } = await supabase.from("events").insert([
    {
      table_id: tableId,
      event_type: "harvest",
      created_at: now,
    },
  ]);

  if (eventError) {
    // Silently handle event error
  }
}

// Update status ganti air
export async function updateWaterChange(tableId: string): Promise<void> {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("User tidak terautentikasi");
  }

  const now = new Date().toISOString();

  // Update meja
  const { error: tableError } = await supabase
    .from("hydroponic_tables")
    .update({ last_water_change_at: now })
    .eq("id", tableId);

  if (tableError) {
    throw new Error("Gagal update status ganti air");
  }

  // Catat event
  const { error: eventError } = await supabase.from("events").insert([
    {
      table_id: tableId,
      event_type: "water_change",
      created_at: now,
    },
  ]);

  if (eventError) {
    // Silently handle event error
  }
}

// Hapus meja
export async function deleteTable(tableId: string): Promise<void> {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("User tidak terautentikasi");
  }

  const { error } = await supabase
    .from("hydroponic_tables")
    .delete()
    .eq("id", tableId);

  if (error) {
    throw new Error("Gagal menghapus meja");
  }
}
