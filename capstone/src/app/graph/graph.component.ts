import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { forceSimulation } from 'd3-force';
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
  private width = 400;
  private height = 400;
  private maxRadius = 30;
  private minRadius = 5;

  constructor() { }

  ngOnInit(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.createSvg();
    d3.json("/testJSON/test4.json")
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
    .attr("r", ((d: GenericNode) => Math.max(this.minRadius, Math.max(d.tot_packets, this.maxRadius))))
    .style("fill", ((d: GenericNode) => d?.program ? "#3f51b5" : "#D86A0F"))

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
    .force("charge", d3.forceManyBody().strength(600))
    .force("collision", d3.forceCollide().radius(d => {return Math.max(this.minRadius, Math.max((d as GenericNode).tot_packets, this.maxRadius)+20);}))

    .on("tick", () =>{
      link
      .attr("x1", (d: { source: { x: any; }; }) => { return this.boundX(d.source.x); })
      .attr("y1", (d: { source: { y: any; }; }) => { return this.boundY(d.source.y); })
      .attr("x2", (d: { target: { x: any; }; }) => { return this.boundX(d.target.x); })
      .attr("y2", (d: { target: { y: any; }; }) => { return this.boundY(d.target.y); });

      g
      .attr("transform", (d: GenericNode) => {return "translate(" + this.boundX(d.x) + ","+ this.boundY(d.y) + ")"})
    });
  }

  private boundY(y:number|null|undefined) : number {
    return Math.max(20, Math.min(this.height-10, y ? y : 0));
  }

  private boundX(x:number|null|undefined) : number {
    return Math.max(40, Math.min(this.width-10, x ? x : 0));
  }
}
