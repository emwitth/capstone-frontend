export interface ProgNode {
    program: ProgInfo,
    tot_packets: number,
    x?: number,
    y?: number
}

export interface ProgInfo {
    name: string,
    socket: string,
    timestamp: string
}