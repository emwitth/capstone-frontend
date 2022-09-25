import { Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { forceSimulation } from 'd3-force';
import { PROGRAM_COLOR, IP_COLOR } from '../constants';
import { ProgNode, ProgInfo } from '../interfaces/prog-node';
import { IPNode } from '../interfaces/ipnode';
import { Link } from '../interfaces/link';

export interface GraphJSON {
  prog_nodes: Array<ProgNode>,
  ip_nodes: Array<IPNode>,
  links: Array<Link>
}

export interface GenericNode {
  tot_packets: number,
  program?: ProgInfo,
  ip?: string,
  x?: number,
  y?: number
}

export interface ForceLink {
  source: string,
  target: string
}

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  private svg: any;
  private width = 500;
  private height = 700;
  private maxRadius = 70;
  private minRadius = 20;

  constructor(private elem: ElementRef) { }

  ngOnInit(): void {
    console.log(this,this.elem.nativeElement)
    this.width = this.elem.nativeElement.offsetWidth;
    this.height = window.innerHeight-23;
    console.log(this.width);
    console.log(this.height);
    this.createSvg();
    d3.json("/testJSON/test5.json")
    .then(data => this.makeGraph(data as GraphJSON));
  }
  private createSvg(): void {
    this.svg = d3.select("div#graph")
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g");
  }

  private makeGraph(data: GraphJSON): void {
    console.log(data);

    var allNodes: Array<GenericNode> = new Array<GenericNode>();
    allNodes = allNodes.concat(data.ip_nodes, data.prog_nodes);

    console.log(allNodes);

    var links: Array<ForceLink> = data.links.map(x => ({source: x.ip, target: x.program}));

    // Initialize the links
    const link = this.svg
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .style("stroke", "black");

    const g = this.svg
    .selectAll(null)
    .data(allNodes)
    .enter()
    .append("g")

    g.append("circle")
    .attr("r", ((d: GenericNode) => this.calculateRadius(d)))
    .style("fill", (
      (d: GenericNode) => {
       return d3.color(d?.program ? PROGRAM_COLOR : IP_COLOR)?.darker(d.tot_packets/40)
      }))

    g.append("text")
    .text((d: GenericNode) => d?.program ? d.program : d?.ip)
    .attr("dominant-baseline", "text-after-edge")
    .attr("text-anchor", "middle")

    // Let's list the force we wanna apply on the network
    const simulation = forceSimulation(allNodes)
    .force("link", d3.forceLink()
        .id(d => { return (d as GenericNode)?.program ? 
                          (d as GenericNode)?.program + "" : 
                          (d as GenericNode).ip + ""; })
        .links(links)
    )
    .force("center", d3.forceCenter(this.width/2, this.height/2))
    .force("charge", d3.forceManyBody().strength(300))
    .force("collision", d3.forceCollide().radius(
                                d => { return this.calculateRadius(d as GenericNode) + 30;}))
    .on("tick", () =>{
      link
      .attr("x1", (d: { source: { x: any; }; }) => { return this.boundX(d.source.x, 20); })
      .attr("y1", (d: { source: { y: any; }; }) => { return this.boundY(d.source.y, 20); })
      .attr("x2", (d: { target: { x: any; }; }) => { return this.boundX(d.target.x, 20); })
      .attr("y2", (d: { target: { y: any; }; }) => { return this.boundY(d.target.y, 20); });

      g
      .attr("transform", (d: GenericNode) => {
        return "translate(" 
        + this.boundX(d.x, d.tot_packets) 
        + ","
        + this.boundY(d.y, d.tot_packets) 
        + ")"
      })
    });
  }

  private calculateRadius(node: GenericNode): number {
    return Math.min(this.maxRadius, Math.max(node.tot_packets, this.minRadius));
  }

  private boundY(y:number|null|undefined, r:number): number {
    return Math.max(r+30, Math.min(this.height-r-10, y ? y : 0));
  }

  private boundX(x:number|null|undefined, r:number): number {
    return Math.max(r+30, Math.min(this.width-r-10, x ? x : 0));
  }
}
