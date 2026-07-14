import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { registerCondition } from "./quartz/plugins/loader/loader"
import * as ExternalPlugin from "./.quartz/plugins"

// Only render layout components with `condition: index-only` on the home page.
registerCondition("index-only", (props) => props.fileData.slug === "index")

// Options that YAML can't express (functions). Merged over the YAML options
// for recent-notes in quartz.config.yaml.
ExternalPlugin.RecentNotes({
  filter: (f: Record<string, unknown>) => typeof f.slug === "string" && f.slug.startsWith("posts/"),
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
