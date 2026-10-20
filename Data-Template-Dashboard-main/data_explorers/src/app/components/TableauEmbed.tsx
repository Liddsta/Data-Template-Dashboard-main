import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { tableauEmbedUrl, tableauViewUrl, type VizSlotDef } from "../data/vizRegistry";

interface Props {
  def: VizSlotDef;
}

export function TableauEmbed({ def }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 border-b border-border">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600/60" />
            <span className="text-xs font-mono text-blue-600/70 uppercase tracking-widest">Tableau</span>
          </div>
          <p className="text-sm font-medium text-foreground mt-2">{def.title}</p>
          {def.description && (
            <p className="text-xs text-muted-foreground mt-1">{def.description}</p>
          )}
        </div>
        <a
          href={tableauViewUrl(def)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open
        </a>
      </div>

      {/* Tableau renders on a light canvas, so the viewport stays white in both
          themes. An explicit height wins over the 4:3 default, which at full
          page width is far taller than a short sheet needs. */}
      <div
        className={def.height ? "relative bg-white" : "relative bg-white aspect-[4/3]"}
        style={def.height ? { height: def.height } : { minHeight: def.minHeight ?? "420px" }}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-card">
            <span className="text-xs font-mono text-muted-foreground animate-pulse">
              Loading visualization…
            </span>
          </div>
        )}
        <iframe
          src={tableauEmbedUrl(def)}
          title={def.title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
        />
      </div>
    </div>
  );
}
