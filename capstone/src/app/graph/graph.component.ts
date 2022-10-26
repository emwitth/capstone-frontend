import { Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { forceSimulation } from 'd3-force';
import { PROGRAM_COLOR, IP_COLOR, GRAPH_TEXT_COLOR } from '../constants';
import { ProgNode, ProgInfo } from '../interfaces/prog-node';
import { IPNode } from '../interfaces/ipnode';
import { Link } from '../interfaces/link';

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
  private linkSvg: any;
  private nodeSvg: any;
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
    d3.json("/api/graph-data")
    .then(data => this.makeGraph(data as GraphJSON));
  }
 
  public update() {
    d3.json("/api/graph-data")
    .then(data => this.updateGraph(data as GraphJSON));
  }

  private createSvg(): void {
    this.svg = d3.select("div#graph")
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height);
    this.linkSvg = this.svg.append("g").attr("id", "links")
    this.nodeSvg = this.svg.append("g").attr("id", "nodes");
  }

  private makeGraph(data: GraphJSON): void {
    console.log("Data: ", data);

    this.makeLinksAndNodes(data);

    this.initializeSimulation();

    // this.buildNodesCirclesAndText();

    this.simulation.nodes(this.allNodes);
    this.simulation.force("link").links(this.links);
    this.simulation.alpha(.6).restart();
  }

  private updateGraph(data: GraphJSON) {
    this.makeLinksAndNodes(data);

    this.simulation.nodes(this.allNodes);
    this.simulation.force("link").links(this.links);
    this.simulation.alpha(.01).restart();
  }

  private initializeSimulation() {
    this.simulation = forceSimulation(this.allNodes)
    .force("link", d3.forceLink()
      .id(d => { return (d as GenericNode)?.program ? 
                        (d as GenericNode)?.program?.name + "" + (d as GenericNode)?.program?.socket : 
                        (d as GenericNode).ip + ""; })
      .links(this.links)
    )
    // .force("charge", d3.forceManyBody().strength(300))
    // .force("x", d3.forceX().x(this.width/2))
    // .force("y", d3.forceY().y(this.height/2))
    .force("collision", d3.forceCollide().radius(
                                d => { return this.calculateRadius(d as GenericNode) + 30;}))
    .on("tick", () => this.tick());
  }

  private makeLinksAndNodes(data: GraphJSON) {
    console.log(data);

    var allNodesNoChords = new Array<GenericNodeNoChords>().concat(data.ip_nodes, data.prog_nodes);
    this.allNodes = allNodesNoChords.map(n => {
        var oldNode = this.allNodes.find(element => {
          return element.ip === n.ip &&
          element.name === n.name &&
          element.program?.name == n.program?.name &&
          element.program?.socket == n.program?.socket
        })
        return {
          tot_packets: n.tot_packets,
          program: n?.program,
          name: n?.name,
          ip: n?.ip,
          x: oldNode?.x ? oldNode.x : this.width/2,
          y: oldNode?.y ? oldNode.y : this.height/2
        }
    } );

    console.log("ALL NODES:", this.allNodes);

    this.links = data.links.map(x => ({source: x.ip, target: x.program.name + x.program.socket}));

    console.log("LINKS: ", this.links);

    // Initialize the links
    this.link = this.linkSvg
    .selectAll("line")
    .data(this.links, (l: any) => {return l.source + l.target;})
    .join("line")
    .style("stroke", "black");

    // Initialize the nodes
    this.g = this.nodeSvg
    .selectAll("g")
    .data(this.allNodes, (d: any) => {
      return d.program ? d.program.name + d.program.socket : d.ip;
    })
    .join(
      (enter: any) => { 
        return enter.append("g").call((parent: any) => {
          parent.append("circle")
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
              d3.select(d.target).attr("class", "")
            })
            .call(this.drag());

            parent.append("text")
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
          });
      },
      (update: any) => {
        update.select("circle").transition().duration(500)
        .attr("r", ((d: GenericNode) => this.calculateRadius(d)))
        .style("fill", (
          (d: GenericNode) => {
            if(d.tot_packets > this.maxRadius)
            {
              return d3.color(d?.program ? PROGRAM_COLOR : IP_COLOR)?.darker(d.tot_packets/400)
            }
            return d3.color(d?.program ? PROGRAM_COLOR : IP_COLOR)
          }));

          update.select("text").transition().duration(500)
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

          return update;
      },
      (exit: any) => {
        return exit.remove();
      }
    );
    console.log("Nodes Initialized");
  }

  private drag() {
    return d3.drag()
    .on("start", event => {
      if(!event.active) this.simulation.alphaTarget(0.1).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    })
    .on("drag", event => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    })
    .on("end", event => {
      if(!event.active) this.simulation.alphaTarget(0);
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
      var x = this.boundX(d.x, d.tot_packets);
      var y = this.boundY(d.y, d.tot_packets);
      d.x = x;
      d.y = y;
      return "translate(" + x + "," + y + ")"
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
