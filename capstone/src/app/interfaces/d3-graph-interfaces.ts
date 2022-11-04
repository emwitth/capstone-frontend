import { ProgNode } from "./prog-node";
import { IPNode } from "./ipnode";
import { Link } from "./link";
import { ProgInfo } from "./prog-node";

export interface GraphJSON {
  prog_nodes: Array<ProgNode>,
  ip_nodes: Array<IPNode>,
  links: Array<Link>
}

export interface GenericNodeNoChords {
  tot_packets: number,
  program?: ProgInfo,
  name?: string,
  ip?: string
}

export interface GenericNode {
  tot_packets: number,
  program?: ProgInfo,
  name?: string,
  ip?: string,
  x: number,
  y: number
}

export interface LinkData {
  source: GenericNode,
  target: GenericNode,
  in_packets: number,
  out_packets: number
}

export interface ForceLink {
  source: string,
  target: string,
  in_packets: number,
  out_packets: number
}