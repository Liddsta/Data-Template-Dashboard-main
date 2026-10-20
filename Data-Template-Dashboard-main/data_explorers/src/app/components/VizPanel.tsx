import { TableauEmbed } from "./TableauEmbed";
import { vizSlots, type VizSlot } from "../data/vizRegistry";

interface Props {
  /** Registry key supplying this panel's heading and source worksheet. */
  slot: VizSlot;
}

/**
 * A dashboard slot filled by a Tableau Public worksheet. Every slot in the
 * registry has a published sheet, so there is no pending state to render.
 */
export function VizPanel({ slot }: Props) {
  return <TableauEmbed def={vizSlots[slot]} />;
}
