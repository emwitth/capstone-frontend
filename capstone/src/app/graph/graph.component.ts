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
  name?: string,
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
  private g: any;
  private link: any;
  private simulation: any;
  private allNodes: Array<GenericNode> = new Array<GenericNode>();
  private links: Array<ForceLink> = new Array<ForceLink>();
  private width = 500;
  private height = 700;
  private maxRadius = 70;
  private minRadius = 10;

  constructor(private elem: ElementRef) { }

  ngOnInit(): void {
    console.log(this,this.elem.nativeElement)
    this.width = this.elem.nativeElement.offsetWidth;
    // this.height = window.innerHeight-7;
    this.height = window.innerHeight-40;
    console.log(this.width);
    console.log(this.height);
    this.createSvg();
    // this.initializeSimulation();
    // d3.json("/api/graph-data")
    d3.json("/testJSON/test32.json")
    .then(data => this.makeGraph(data as GraphJSON));
  }

  private createSvg(): void {
    this.svg = d3.select("div#graph")
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g");
  }

  private initializeSimulation() {
    this.simulation = forceSimulation(this.allNodes)
    .force("link", d3.forceLink()
      .id(d => { return (d as GenericNode)?.program ? 
                        (d as GenericNode)?.program?.name + "" + (d as GenericNode)?.program?.socket : 
                        (d as GenericNode).ip + ""; })
      .links(this.links)
    )
    .force("charge", d3.forceManyBody().strength(300))
    .force("x", d3.forceX().x(this.width/2))
    .force("y", d3.forceY().y(this.height/2))
    .force("collision", d3.forceCollide().radius(
                                d => { return this.calculateRadius(d as GenericNode) + 30;}))
    .on("tick", () => this.tick());
  }

  private makeLinksAndNodes(data: GraphJSON) {
    this.allNodes = new Array<GenericNode>().concat(data.ip_nodes, data.prog_nodes);

    console.log(this.allNodes);

    this.links = data.links.map(x => ({source: x.ip, target: x.program.name + x.program.socket}));

    // Initialize the links
    this.link = this.svg
    .selectAll("line")
    .data(this.links)
    .join("line")
    .style("stroke", "black");

    // Initialize the nodes
    this.g = this.svg
    .selectAll("g")
    .data(this.allNodes, (d: any) => {
      return d.program ? d.program.name + d.program.socket : d.ip;
    })
    .join(
      (enter: any) => { 
        return enter.append("g");
      },
      (update: any) => {
        return update.transition()
      },
      (exit: any) => {
        return exit.remove()
      }
    );
  }

  private buildNodesCirclesAndText(){
    this.g.append("circle")
    .attr("r", ((d: GenericNode) => this.calculateRadius(d)))
    .style("fill", (
      (d: GenericNode) => {
        if(d.tot_packets > this.maxRadius)
        {
          return d3.color(d?.program ? PROGRAM_COLOR : IP_COLOR)?.darker(d.tot_packets/400)
        }
        return d3.color(d?.program ? PROGRAM_COLOR : IP_COLOR)
      }))
      .on("mouseover", (d: { target: any; }) => {
        d3.select(d.target).attr("class", "hover-indication");
      })
      .on("mouseout", (d: { target: any; }) => {
        d3.select(d.target).attr("class", "");
      })
      .call(this.drag(this.simulation));

    this.g.append("text")
    .style("fill", GRAPH_TEXT_COLOR)
    .text((d: GenericNode) => {
        if(d?.program) {
          return d.program.name;
        } 
        else if ((d as IPNode)?.name !== "no hostname") {
          return (d as IPNode)?.name;
        }  
        else {
          return (d as IPNode)?.ip;
        }
    })
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "middle")
    .style("font-size", (d: GenericNode) => {
      return Math.max(8, Math.min(12, d.tot_packets));
    });
  }

  private makeGraph(data: GraphJSON): void {
    console.log(data);

    this.makeLinksAndNodes(data);

    this.initializeSimulation();

    this.buildNodesCirclesAndText();

    this.simulation.nodes(this.allNodes);
    this.simulation.force("link").links(this.links);
    this.simulation.alpha(1).restart();
  }

  private updateGraph(data: GraphJSON) {
    console.log(data);

    this.makeLinksAndNodes(data);

    this.buildNodesCirclesAndText();

    this.simulation.nodes(this.allNodes);
    this.simulation.force("link").links(this.links);
    this.simulation.alpha(1).restart();
  }

  public update() {
    d3.json("/testJSON/test33.json")
    .then(data => this.makeGraph(data as GraphJSON));
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

  private tick() {
    this.link
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
    
    this.g
    .attr("transform", (d: GenericNode) => {
      return "translate(" 
      + this.boundX(d.x, d.tot_packets) 
      + ","
      + this.boundY(d.y, d.tot_packets) 
      + ")"
    })
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
