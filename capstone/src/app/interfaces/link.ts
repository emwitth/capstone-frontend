import { ProgInfo } from "./prog-node";

export interface Link {
    ip: string,
    program: ProgInfo,
    in_packets: number,
    out_packets: number,
    x?: number,
    y?: number
}