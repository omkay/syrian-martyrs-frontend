"use server"

import { getMartyrById } from "@/lib/db"
import type { Martyr } from "@/lib/types"

export async function getMartyrByIdAction(id: string): Promise<Martyr | null> {
  try {
    const martyr = await getMartyrById(id)
    return martyr
  } catch (error) {
    console.error("Error fetching martyr:", error)
    return null
  }
}
