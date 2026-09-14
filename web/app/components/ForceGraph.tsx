"use client";

import { useEffect, useRef, useState } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";

interface ForceGraphProps {
  graphData: {
    nodes: any[];
    links: any[];
  };
  onNodeClick: (node: any) => void;
  theme: string;
}

export default function ForceGraph({ graphData, onNodeClick, theme }: ForceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({ width: clientWidth, height: clientHeight || 400 });
    }
    
    setTimeout(() => {
      if (graphRef.current) {
        graphRef.current.zoomToFit(400, 50);
      }
    }, 500);
  }, [graphData]);

  const isDark = theme === "dark";
  const textColor = isDark ? "#e2e8f0" : "#0f172a";
  const nodeColor = isDark ? "#6366f1" : "#4f46e5"; // Indigo
  const linkColor = isDark ? "#334155" : "#cbd5e1"; // Slate
  const bgColor = isDark ? "#020617" : "#f8fafc";

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] flex items-center justify-center bg-transparent rounded-xl">
      {graphData.nodes.length === 0 ? (
        <div className="text-center text-slate-500 text-sm">No topics learned yet. Teach your AI a rule to build its map.</div>
      ) : (
        <ForceGraph2D
          ref={graphRef as any}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="id"
          nodeColor={() => nodeColor}
          linkColor={() => linkColor}
          linkWidth={1.5}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          onNodeClick={onNodeClick}
          backgroundColor={bgColor}
          nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
            const label = node.id;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = nodeColor;
            ctx.fill();
            
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = textColor;
            ctx.fillText(label, node.x, node.y + 8 + fontSize);
          }}
          cooldownTicks={100}
          onEngineStop={() => {
            if (graphRef.current) {
               graphRef.current.zoomToFit(400, 50);
            }
          }}
        />
      )}
    </div>
  );
}
