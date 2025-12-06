import { getSettings } from "@/lib/store"
import { HeroClient } from "./hero-client"

export async function Hero() {
  const settings = await getSettings()
  return <HeroClient settings={settings} />
}


