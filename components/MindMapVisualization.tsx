import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { jsPDF } from 'jspdf';
import { MindMapNode } from '../types';

interface MindMapProps {
  data: MindMapNode;
}

const MindMapVisualization: React.FC<MindMapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = 600;
    
    const root = d3.hierarchy(data);
    const treeLayout = d3.tree<MindMapNode>().size([height - 100, width - 200]);
    
    treeLayout(root);

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(100, 50)"); // Left margin for root label

    // Links
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#ef4444") // Red accent
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.4)
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any
      )
      .transition() // Animate links on load
      .duration(1000)
      .attr("opacity", 0.6);

    // Nodes Group
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
      .style("cursor", "pointer");

    // Interactivity: Mouse Over
    node.on("mouseover", function(event, d) {
        // Enlarge circle
        d3.select(this).select("circle")
            .transition().duration(200)
            .attr("r", 9)
            .attr("fill", "#ef4444") // Highlight color
            .attr("stroke", "#fff")
            .attr("stroke-width", 3);
        
        // Bold text and brighten
        d3.select(this).select("text")
            .transition().duration(200)
            .attr("font-weight", "700")
            .attr("fill", "#ffffff")
            .style("text-shadow", "0 0 10px rgba(239, 68, 68, 0.5)"); // Glow effect

        // Highlight incoming links
        svg.selectAll(".link")
            .filter((link: any) => link.target === d)
            .transition().duration(200)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2.5)
            .attr("opacity", 1);
    })
    // Interactivity: Mouse Out
    .on("mouseout", function(event, d) {
        d3.select(this).select("circle")
            .transition().duration(300)
            .attr("r", 6)
            .attr("fill", "#0a0a0b")
            .attr("stroke", "#e2e8f0")
            .attr("stroke-width", 2);

        d3.select(this).select("text")
            .transition().duration(300)
            .attr("font-weight", "normal")
            .attr("fill", "#e2e8f0")
            .style("text-shadow", "0 1px 3px rgba(0,0,0,0.8)");
        
        svg.selectAll(".link")
            .filter((link: any) => link.target === d)
            .transition().duration(300)
            .attr("stroke", "#ef4444")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.6);
    });

    // Node Circles
    node.append("circle")
      .attr("r", 0) // Start small for animation
      .attr("fill", "#0a0a0b")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 2)
      .transition() // Animate entrance
      .duration(500)
      .delay((d) => d.depth * 200)
      .attr("r", 6);

    // Node Labels
    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", (d: any) => d.children ? -12 : 12)
      .attr("text-anchor", (d: any) => d.children ? "end" : "start")
      .text((d: any) => d.data.name)
      .attr("fill", "#e2e8f0")
      .attr("font-size", "14px")
      .attr("font-family", "IBM Plex Sans Arabic")
      .style("text-shadow", "0 1px 3px rgba(0,0,0,0.8)")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .delay((d) => d.depth * 200)
      .style("opacity", 1);

  }, [data]);

  const handleExport = (format: 'png' | 'pdf') => {
    if (!svgRef.current || isExporting) return;
    setIsExporting(true);

    const svgElement = svgRef.current;
    const width = parseInt(svgElement.getAttribute("width") || "800");
    const height = parseInt(svgElement.getAttribute("height") || "600");

    // Serialize SVG
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);

    // Prepare Canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    // Fill background (SVG is usually transparent)
    ctx.fillStyle = "#121214"; // matches bg-blacksteel-800
    ctx.fillRect(0, 0, width, height);

    // Create Image
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const imgData = canvas.toDataURL("image/png");

      if (format === 'png') {
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `unix-mindmap-${Date.now()}.png`;
        link.click();
      } else {
        const pdf = new jsPDF({
          orientation: width > height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [width, height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(`unix-mindmap-${Date.now()}.pdf`);
      }
      setIsExporting(false);
    };

    img.onerror = () => {
      console.error("Failed to load SVG for export");
      setIsExporting(false);
    };

    img.src = url;
  };

  return (
    <div ref={containerRef} className="w-full overflow-x-auto bg-blacksteel-800 rounded-lg border border-blacksteel-600 p-4 mt-4 shadow-inner transition-all duration-300 hover:border-blacksteel-accent/50 hover:shadow-red-500/10 group/map relative">
      <div className="flex justify-between items-center mb-2 px-2">
        <span className="text-xs text-blacksteel-accent uppercase tracking-wider group-hover/map:text-red-300 transition-colors">Mind Map Generated</span>
        
        <div className="flex space-x-2 space-x-reverse opacity-0 group-hover/map:opacity-100 transition-opacity duration-300">
           <button 
            onClick={() => handleExport('png')}
            disabled={isExporting}
            className="flex items-center space-x-1 space-x-reverse text-xs text-gray-300 hover:text-blacksteel-accent hover:bg-white/5 px-2 py-1 rounded transition-all disabled:opacity-50"
            title="Export as PNG"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span>PNG</span>
          </button>
          
          <button 
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="flex items-center space-x-1 space-x-reverse text-xs text-gray-300 hover:text-blacksteel-accent hover:bg-white/5 px-2 py-1 rounded transition-all disabled:opacity-50"
            title="Export as PDF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <span>PDF</span>
          </button>
        </div>
      </div>
      <svg ref={svgRef} className="mx-auto"></svg>
    </div>
  );
};

export default MindMapVisualization;