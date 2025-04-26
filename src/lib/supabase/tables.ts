import { supabase } from "./client";
import { HydroponicTable } from "@/types";
import { getCurrentUser } from "./auth";

// Mengambil semua meja hidroponik milik user
export async function getTables(): Promise<HydroponicTable[]> {
  try {
    console.log("Getting tables...");
    const user = getCurrentUser();
    console.log("Current user:", user);

    if (!user) {
      console.error("No user found in cookies/localStorage");
      throw new Error("User tidak terautentikasi");
    }

    // Untuk debugging - coba tanpa filter user_id dulu
    console.log("Fetching all tables without user filter for debugging");
    const { data, error } = await supabase
      .from("hydroponic_tables")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tables:", error);
      throw new Error(`Gagal mengambil data meja: ${error.message}`);
    }

    console.log("Tables fetched:", data);

    // Filter tables by user_id manually if needed
    const userTables = data
      ? data.filter((table) => table.user_id === user.id)
      : [];
    console.log("Tables filtered for user:", userTables);

    // Konversi string dates menjadi Date objects
    return userTables.map((table) => ({
      id: table.id,
      name: table.name,
      description: table.description,
      lastHarvest: table.last_harvest_at
        ? new Date(table.last_harvest_at)
        : null,
      lastWaterChange: table.last_water_change_at
        ? new Date(table.last_water_change_at)
        : null,
    })) as HydroponicTable[];
  } catch (err) {
    console.error("Error in getTables:", err);

    // FALLBACK: Jika ada error, gunakan data dummy untuk development
    if (process.env.NODE_ENV === "development") {
      console.log("Using fallback dummy data for development");
      return [
        {
          id: "fallback-1",
          name: "Meja Selada (Fallback)",
          description: "Data fallback karena error database",
          lastHarvest: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          lastWaterChange: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: "fallback-2",
          name: "Meja Kangkung (Fallback)",
          description: "Data fallback karena error database",
          lastHarvest: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          lastWaterChange: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ];
    }

    throw err;
  }
}

// Menambah meja hidroponik baru
export async function addTable(
  tableData: Omit<HydroponicTable, "id">
): Promise<HydroponicTable> {
  try {
    console.log("Adding new table:", tableData);
    const user = getCurrentUser();
    console.log("Current user:", user);

    if (!user) {
      console.error("No user found in cookies/localStorage");
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

    console.log("New table data to insert:", newTableData);

    const { data, error } = await supabase
      .from("hydroponic_tables")
      .insert([newTableData])
      .select()
      .single();

    if (error) {
      console.error("Error adding table:", error);
      throw new Error(`Gagal menambahkan meja: ${error.message}`);
    }

    console.log("Table added successfully:", data);

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      lastHarvest: data.last_harvest_at ? new Date(data.last_harvest_at) : null,
      lastWaterChange: data.last_water_change_at
        ? new Date(data.last_water_change_at)
        : null,
    };
  } catch (err) {
    console.error("Error in addTable:", err);

    // FALLBACK: Jika ada error, buat ID dummy untuk development
    if (process.env.NODE_ENV === "development") {
      console.log("Using fallback for development");
      return {
        id: `fallback-${Date.now()}`,
        name: tableData.name,
        description: tableData.description,
        lastHarvest: tableData.lastHarvest,
        lastWaterChange: tableData.lastWaterChange,
      };
    }

    throw err;
  }
}

// Update status panen
export async function updateHarvest(tableId: string): Promise<void> {
  try {
    console.log("Updating harvest for table:", tableId);
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
      console.error("Error updating harvest:", tableError);
      throw new Error(`Gagal update status panen: ${tableError.message}`);
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
      console.error("Error recording harvest event:", eventError);
    }
  } catch (err) {
    console.error("Error in updateHarvest:", err);

    // FALLBACK: Return silently for development
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Using fallback for development - pretending update succeeded"
      );
      return;
    }

    throw err;
  }
}

// Update status ganti air
export async function updateWaterChange(tableId: string): Promise<void> {
  try {
    console.log("Updating water change for table:", tableId);
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
      console.error("Error updating water change:", tableError);
      throw new Error(`Gagal update status ganti air: ${tableError.message}`);
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
      console.error("Error recording water change event:", eventError);
    }
  } catch (err) {
    console.error("Error in updateWaterChange:", err);

    // FALLBACK: Return silently for development
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Using fallback for development - pretending update succeeded"
      );
      return;
    }

    throw err;
  }
}

// Hapus meja
export async function deleteTable(tableId: string): Promise<void> {
  try {
    console.log("Deleting table:", tableId);
    const user = getCurrentUser();

    if (!user) {
      throw new Error("User tidak terautentikasi");
    }

    const { error } = await supabase
      .from("hydroponic_tables")
      .delete()
      .eq("id", tableId);

    if (error) {
      console.error("Error deleting table:", error);
      throw new Error(`Gagal menghapus meja: ${error.message}`);
    }
  } catch (err) {
    console.error("Error in deleteTable:", err);

    // FALLBACK: Return silently for development
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Using fallback for development - pretending delete succeeded"
      );
      return;
    }

    throw err;
  }
}
