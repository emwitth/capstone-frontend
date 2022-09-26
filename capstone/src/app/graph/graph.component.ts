import { Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { forceSimulation } from 'd3-force';
import { PROGRAM_COLOR, IP_COLOR, GRAPH_TEXT_COLOR } from '../constants';
import { ProgNode, ProgInfo } from '../interfaces/prog-node';
import { IPNode } from '../interfaces/ipnode';
import { Link } from '../interfaces/link';
import { of } from 'rxjs';

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
  private minRadius = 10;

  constructor(private elem: ElementRef) { }

  ngOnInit(): void {
    console.log(this,this.elem.nativeElement)
    this.width = this.elem.nativeElement.offsetWidth;
    this.height = window.innerHeight-7;
    console.log(this.width);
    console.log(this.height);
    this.createSvg();
    d3.json("/testJSON/test3.json")
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
    .append("g");

    // Let's list the force we wanna apply on the network
    var simulation = forceSimulation(allNodes)
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
      .attr("x1", (d: { source: { x: any; }; }) => {
        var x = this.boundX(d.source.x, 0);
        d.source.x = x;
        return x; 
      })
      .attr("y1", (d: { source: { y: any; }; }) => {
        var y = this.boundY(d.source.y, 0);
        d.source.y = y;
        return y;
      })
      .attr("x2", (d: { target: { x: any; }; }) => {
        var x = this.boundX(d.target.x, 0);
        d.target.x = x;
        return x;
      })
      .attr("y2", (d: { target: { y: any; }; }) => {
        var y = this.boundY(d.target.y, 0);
        d.target.y = y;
        return y; 
      });
      
      g
      .attr("transform", (d: GenericNode) => {
        return "translate(" 
        + this.boundX(d.x, d.tot_packets) 
        + ","
        + this.boundY(d.y, d.tot_packets) 
        + ")"
      })
    });

    g.append("circle")
    .attr("r", ((d: GenericNode) => this.calculateRadius(d)))
    .style("fill", (
      (d: GenericNode) => {
       return d3.color(d?.program ? PROGRAM_COLOR : IP_COLOR)?.darker(d.tot_packets/40)
      }))
      .on("mouseover", (d: { target: any; }) => {
        d3.select(d.target).attr("class", "hover-indication");
      })
      .on("mouseout", (d: { target: any; }) => {
        d3.select(d.target).attr("class", "");
      })
      .call(this.drag(simulation));

    g.append("text")
    .style("fill", GRAPH_TEXT_COLOR)
    .text((d: GenericNode) => {
        return d?.program ? d.program : d?.ip;  
    })
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "middle")
    .style("font-size", (d: GenericNode) => {
      return Math.max(8, Math.min(12, d.tot_packets));
    });
  }

  private drag(simulation: d3.Simulation<GenericNode, any>) {
    return d3.drag()
    .on("start", event => {
      if(!event.active) simulation.alphaTarget(.6).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    })
    .on("drag", event => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    })
    .on("end", event => {
      if(!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    });
  }

  private calculateRadius(node: GenericNode): number {
    return this.calculateRadiusNum(node.tot_packets);
  }

  private calculateRadiusNum(radius: number): number {
    return Math.min(this.maxRadius, Math.max(radius, this.minRadius));
  }

  private boundY(y:number|null|undefined, r:number): number {
    var newR: number = this.calculateRadiusNum(r);
    return Math.max(newR, Math.min(this.height-newR, y ? y : 0));
  }

  private boundX(x:number|null|undefined, r:number): number {
    var newR: number = this.calculateRadiusNum(r);
    return Math.max(newR, Math.min(this.width-newR, x ? x : 0));
  }

}
