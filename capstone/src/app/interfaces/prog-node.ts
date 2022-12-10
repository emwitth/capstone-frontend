export interface ProgNode {
  program: ProgInfo,
  tot_packets: number
}

export interface ProgInfo {
  name: string,
  port: string,
  fd: string,
  timestamp: string
}