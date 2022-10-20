export interface ProgNode {
    program: ProgInfo,
    tot_packets: number
}

export interface ProgInfo {
    name: string,
    socket: string,
    timestamp: string
}