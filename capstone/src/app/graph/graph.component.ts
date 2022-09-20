import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { SimulationNodeDatum } from 'd3';
import { forceSimulation } from 'd3-force';

export interface Node {
  id: number,
  name: string,
  x?:number,
  y?:number
}

export interface Link {
  source: number,
  target: number
}

export interface GraphJSON {
  nodes: Array<Node>,
  links: Array<Link>
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
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_network.json")
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

    // const forceNode = d3.forceManyBody();
    // const forceLink = d3.forceLink(data.links).id(({index: i}) => N[i]);

    // Initialize the links
    const link = this.svg
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
    .style("stroke", "#aaa");

    // Initialize the nodes
    const node = this.svg
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
    .attr("r", 20)
    .style("fill", "#69b3a2");

    // Let's list the force we wanna apply on the network
    const simulation = forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
    .force("link", d3.forceLink()                               // This force provides links between nodes
        .id(function(d) { return (d as Node).id; })                     // This provide  the id of a node
        .links(data.links)                                    // and this the list of links
    )
    .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
    .force("center", d3.forceCenter(this.width / 2, this.height / 2))     // This force attracts nodes to the center of the svg area
    .on("end", () =>{
      link
      .attr("x1", function(d: { source: { x: any; }; }) { return d.source.x; })
      .attr("y1", function(d: { source: { y: any; }; }) { return d.source.y; })
      .attr("x2", function(d: { target: { x: any; }; }) { return d.target.x; })
      .attr("y2", function(d: { target: { y: any; }; }) { return d.target.y; });

      node
      .attr("cx", function (d: { x: number; }) { return d.x+6; })
      .attr("cy", function(d: { y: number; }) { return d.y-6; });
    });

  }
}
