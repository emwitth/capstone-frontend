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
  private margin = 50;
  private width = 750 - (this.margin * 2);
  private height = 400 - (this.margin * 2);

  constructor() { }

  ngOnInit(): void {
    this.createSvg();
    d3.json("/testJSON/test0.json")
    .then(data => this.makeGraph(data as GraphJSON));
  }

  private createSvg(): void {
    this.svg = d3.select("div#graph")
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2))
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
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
    .attr("r", ((d: GenericNode) => d.tot_packets*3))
    .style("fill", ((d: GenericNode) => d?.program ? "blue" : "red"))

    g.append("text")
    .text((d: GenericNode) => d?.program ? d.program : d?.ip)
    .attr("dominant-baseline", "text-after-edge")
    .attr("text-anchor", "middle")

    // Initialize the nodes
    const node = this.svg
    .selectAll("circle")
    .data(allNodes)
    .enter()
    .append("circle")
    .attr("r", ((d: GenericNode) => d.tot_packets*3))
    .style("fill", ((d: GenericNode) => d?.program ? "blue" : "red"));

    // Let's list the force we wanna apply on the network
    const simulation = forceSimulation(allNodes)
    .force("link", d3.forceLink()
        .id(d => { return (d as GenericNode)?.program ? 
                          (d as GenericNode)?.program + "" : 
                          (d as GenericNode).ip + ""; })
        .links(links)
    )
    .force("center", d3.forceCenter(this.width/2, this.height/2))
    .force("collision", d3.forceCollide().radius(d => {return (d as GenericNode).tot_packets * 5;}))

    .on("tick", () =>{
      link
      .attr("x1", function(d: { source: { x: any; }; }) { return d.source.x; })
      .attr("y1", function(d: { source: { y: any; }; }) { return d.source.y; })
      .attr("x2", function(d: { target: { x: any; }; }) { return d.target.x; })
      .attr("y2", function(d: { target: { y: any; }; }) { return d.target.y; });

      g
      .attr("transform", (d: GenericNode) => {return "translate(" + d.x + ","+ d.y + ")"})
    });
  }
}
