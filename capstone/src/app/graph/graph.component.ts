import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import { forceSimulation } from 'd3-force';
import { interval, Subscription } from 'rxjs';
import { PROGRAM_COLOR, IP_COLOR, GRAPH_TEXT_COLOR, INDICATION_BORDER_COLOR, INFO_PANEL_WIDTH } from '../constants';
import { GraphService } from '../services/graph.service';
import { InfoPanelService } from '../services/info-panel.service';
import { IPNode } from '../interfaces/ipnode';
import { GraphJSON, GenericNodeNoChords, GenericNode, ForceLink, LinkData } from '../interfaces/d3-graph-interfaces';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterViewInit, OnDestroy {
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
  private isSizeChange: boolean = false;
  private graphUpdateSubscription: Subscription = new Subscription();
  private isInfoPanelOpen: Boolean = true;

  constructor(private elem: ElementRef, private infoPanelService: InfoPanelService,
    private graphService: GraphService) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Set the width and height of the graph element.
    this.width = this.elem.nativeElement.offsetWidth;
    this.height = this.elem.nativeElement.offsetHeight;
    console.log(this.width);
    console.log(this.height);
    // Setup the SVG element the graph will be on.
    this.createSvg();
    // Set listener to make graph and start periodic update.
    const graphInterval = interval(2000);
    this.graphService.graphStartEvent.subscribe(() => {
      d3.json("/api/graph-data")
      .then(data => this.makeGraph(data as GraphJSON));
      this.graphUpdateSubscription = graphInterval.subscribe(() => this.update());
    });
    // Set listener to stop periodic update.
    this.graphService.graphStopEvent.subscribe(() => {
      this.graphUpdateSubscription.unsubscribe();
    });
    // Get a graph update when event occurs
    this.graphService.graphUpdateEvent.subscribe(() => {
      this.update();
    });
    // Set subscriptions to update graph width on info panel change
    this.infoPanelService.toggleInfoPanelEvent.subscribe((isInfoPanelOpen: boolean) => {
      if(this.isInfoPanelOpen) {
        this.width += INFO_PANEL_WIDTH;
      } else {
        this.width -= INFO_PANEL_WIDTH;
      }
      this.isInfoPanelOpen = isInfoPanelOpen;
      this.svg.attr("width", this.width);
    });
    this.infoPanelService.updatePanelNodeInfoEvent.subscribe(() => {
      if(!this.isInfoPanelOpen) {
        this.width -= INFO_PANEL_WIDTH;
      }
      this.isInfoPanelOpen = true;
      this.svg.attr("width", this.width);
    });
    this.infoPanelService.updatePanelLinkInfoEvent.subscribe(() => {
      if(!this.isInfoPanelOpen) {
        this.width -= INFO_PANEL_WIDTH;
      }
      this.isInfoPanelOpen = true;
      this.svg.attr("width", this.width);
      this.simulation.alpha(.1).restart();
    });
  }

  ngOnDestroy() {
    // unsubscribe from calling graph update on reload, etc
    this.graphUpdateSubscription.unsubscribe();
  }
 
  /**
   * Gains data from the API and updates the graph.
   */
  public update() {
    d3.json("/api/graph-data")
    .then(data => this.updateGraph(data as GraphJSON));
  }

  /**
   * Creates the SVG element that graph elements will be appended to.
   * Creats two sections one for link and one for nodes so nodes will all appear on top of links.
   */
  private createSvg(): void {
    this.svg = d3.select("div#graph")
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height);
    this.linkSvg = this.svg.append("g").attr("id", "links")
    this.nodeSvg = this.svg.append("g").attr("id", "nodes");
  }

  /**
   * Create the graph initially. Initializes the simulation.
   * 
   * @param data the JSON data gotten via the API
   */
  private makeGraph(data: GraphJSON): void {
    console.log("Data: ", data);

    this.makeLinksAndNodes(data);

    this.initializeSimulation();

    this.simulation.nodes(this.allNodes);
    this.simulation.force("link").links(this.links);
    this.simulation.alpha(.6).restart();
  }

  /**
   * Update the graph with new data.
   * 
   * @param data the JSON data gotten via the API
   */
  private updateGraph(data: GraphJSON) {
    this.makeLinksAndNodes(data);

    this.simulation.nodes(this.allNodes);
    this.simulation.force("link").links(this.links);
    if(this.isSizeChange){
      this.simulation.alpha(.01).restart();
    }
    else {
      this.simulation.alpha(this.simulation.alpha()).restart();
    }
  }

  /**
   * Initializes the simulation. 
   */
  private initializeSimulation() {
    this.simulation = forceSimulation(this.allNodes)
    .force("link", d3.forceLink()
      .id(d => { return (d as GenericNode)?.program ? 
                        (d as GenericNode)?.program?.name + "" + (d as GenericNode)?.program?.fd : 
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

  /**
   * Runs the d3 code for creating the nodes and links and binding data to them.
   * 
   * @param data the JSON gotten via the api
   */
  private makeLinksAndNodes(data: GraphJSON) {
    console.log(data);

    /* 
     * This chunk of code sets the nodes X and Y values to the same coordinates as before the update.
     * Or sets the values to 0 if the node is new. This is so they do not return to the origin on every update.
     */
    var allNodesNoChords = new Array<GenericNodeNoChords>().concat(data.ip_nodes, data.prog_nodes);
    this.isSizeChange = false;
    this.allNodes = allNodesNoChords.map(n => {
        var oldNode = this.allNodes.find(element => {
          return element.ip === n.ip &&
          element.name === n.name &&
          element.program?.name == n.program?.name &&
          element.program?.fd == n.program?.fd
        });

        if (n.tot_packets != oldNode?.tot_packets) {
          this.isSizeChange = true;
        }

        return {
          tot_packets: n.tot_packets,
          program: n?.program,
          name: n?.name,
          ip: n?.ip,
          x: oldNode?.x ? oldNode.x : this.width/2,
          y: oldNode?.y ? oldNode.y : this.height/2
        }
    } );

    // console.log("ALL NODES:", this.allNodes);

    // Set the links data to the correct type needed for the simulation.
    this.links = data.links.map(x => ({source: x.ip, target: x.program.name + x.program.fd, in_packets: x.in_packets, out_packets: x.out_packets}));

    // console.log("LINKS: ", this.links);

    // Initialize or update the links.
    this.link = this.linkSvg
    .selectAll("line")
    .data(this.links, (l: any) => {return l.source + l.target;})
    .join("line")
    .style("stroke", INDICATION_BORDER_COLOR)
    .style("stroke-width", "3px")
    // Show an indication when the mouse is over a line.
    .on("mouseover", (d:any) => {
      d3.select(d.target).attr("class", "hover-indication");
    })
    .on("mouseout", (d:any) => {
      d3.select(d.target).attr("class", "")
    })
    .on("click", (d:any) => {
      this.linkClick(d.target.__data__);
    });

    // Initialize or update the nodes.
    this.g = this.nodeSvg
    .selectAll("g")
    .data(this.allNodes, (d: any) => {
      return d.program ? d.program.name + d.program.port : d.ip;
    })
    .join(
      // Enter is for new nodes.
      (enter: any) => { 
        return enter.append("g")
        .on("click", (d:any) => {
          this.nodeClick(d.target.__data__ as GenericNode);
        })
        // Allow user to drag. Needed because sometimes the force sim kinda sucks.
        .call(this.drag())
        .call((parent: any) => {
          // Append a circle element to each node.
          parent.append("circle")
          .attr("r", ((d: GenericNode) => this.calculateRadius(d)))
          .style("fill", (
            (d: GenericNode) => {
              // Darken the node color if larger than max size.
              if(d.tot_packets > this.maxRadius)
              {
                return d3.color(d?.program ? PROGRAM_COLOR : IP_COLOR)?.darker((d.tot_packets-this.maxRadius)/1000)
              }
              return d3.color(d?.program ? PROGRAM_COLOR : IP_COLOR)
            }))
            .attr("class", "node-border")
            // Show an indication when the mouse is over a circle.
            .on("mouseover", (d:any) => {
              d3.select(d.target).attr("class", "hover-indication node-border");
            })
            .on("mouseout", (d:any) => {
              d3.select(d.target).attr("class", "node-border")
            });

            // Append some text to the node. Either ip, server name, or program name.
            parent.append("text")
            .style("fill", GRAPH_TEXT_COLOR)
            .text((d: GenericNode) => {
              // Decide what should be the text in the node.
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
            // Show an indication when the mouse is over a circle.
            .on("mouseover", (d:any) => {
              d3.select(d.target.parentNode.firstChild).attr("class", "hover-indication node-border");
            })
            .on("mouseout", (d:any) => {
              d3.select(d.target.parentNode.firstChild).attr("class", "node-border")
            })
            // Place the text nicely in the middle of the node.
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "middle")
            // Vary the size of the text depending on the size of the node.
            .style("font-size", (d: GenericNode) => {
              return Math.max(8, Math.min(12, d.tot_packets));
            });
          });
      },
      // Update is for nodes that are not new.
      (update: any) => {
        // Update the radius and color of the circles in the nodes.
        update.select("circle").transition().duration(500)
        .attr("r", ((d: GenericNode) => this.calculateRadius(d)))
        .style("fill", (
          (d: GenericNode) => {
            if(d.tot_packets > this.maxRadius)
            {
              return d3.color(d?.program ? PROGRAM_COLOR : IP_COLOR)?.darker((d.tot_packets-this.maxRadius)/1000)
            }
            return d3.color(d?.program ? PROGRAM_COLOR : IP_COLOR)
          }));

          // Update the size of the the text in the node.
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
      // Exit is for nodes that are no longer with us.
      (exit: any) => {
        return exit.remove();
      }
    );

    // console.log("Nodes Initialized");
  }

  /**
   * Called to implement dragging nodes.
   * 
   * @returns the d3 drag behavior.
   */
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

  /**
   * Called by the simulation for behavior each tick. Updates the node and link positions.
   * Nodes are bound to the graph area so they cannot move off the screen.
   */
  private tick() {
    // Update the link svg position.
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
    
    // Update the node position. 
    // Uses translate because g svg elements do not have coordinate attributes.
    this.g
    .attr("transform", (d: GenericNode) => {
      var x = this.boundX(d.x, d.tot_packets);
      var y = this.boundY(d.y, d.tot_packets);
      d.x = x;
      d.y = y;
      return "translate(" + x + "," + y + ")"
    })
  }

  /**
   * Sends node data to info panel.
   * 
   * @param data the data from the node
   */
  private nodeClick(data: GenericNode) {
    this.infoPanelService.updatePanelNodeInfo(data);
  }

  /**
   * Sends link data to info panel.
   * 
   * @param data the data from the node
   */
   private linkClick(data: LinkData) {
    this.infoPanelService.updatePanelLinkInfo(data);
  }

  /**
   * Calculates a radius given a node for easy calling.
   * Radius must be calculated because a bound is used for nicer visibility.
   * 
   * @param node a node data
   * @returns the radius confined to a bound
   */
  private calculateRadius(node: GenericNode): number {
    return this.calculateRadiusNum(node.tot_packets);
  }

  /**
   * Radius must be calculated because a bound is used for nicer visibility.
   * 
   * @param radius the unbound radius (the total packets in a node)
   * @returns a radius confined to a bound
   */
  private calculateRadiusNum(radius: number): number {
    return Math.min(this.maxRadius, Math.max(radius, this.minRadius));
  }

  /**
   * Calculates the y position and adjusts if it is outside the bound of the graph area.
   * 
   * @param y the y position of a node
   * @param r the radius of the node
   * @returns the new position of y that is within the graph area (adjusted by the size of the node)
   */
  private boundY(y:number|null|undefined, r:number): number {
    var newR: number = this.calculateRadiusNum(r);
    return Math.max(newR, Math.min(this.height-newR, y ? y : 0));
  }

  /**
   * Calculates the x position and adjusts if it is outside the bound of the graph area.
   * 
   * @param x the x position of a node
   * @param r the radius of the node
   * @returns the new position of x that is within the graph area (adjusted by the size of the node)
   */
  private boundX(x:number|null|undefined, r:number): number {
    var newR: number = this.calculateRadiusNum(r);
    return Math.max(newR, Math.min(this.width-newR, x ? x : 0));
  }

}
