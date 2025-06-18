import React, { useEffect, useRef, useState } from 'react';
import { SkillAnalysis } from '../types/skills';

interface CircularWaveformProps {
  skills: SkillAnalysis;
  size?: number;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface SkillCluster {
  centerX: number;
  centerY: number;
  nodes: Node[];
  connections: Array<{ from: number; to: number; opacity: number }>;
}

export default function CircularWaveform({ skills, size = 600 }: CircularWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const clustersRef = useRef<Map<string, SkillCluster>>(new Map());
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  // Track mouse position for hover effects on the canvas
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Get all skill keys dynamically
  const skillEntries: [string, number][] = Object.entries(skills);

  // Generate AI insights for skills
  const getSkillInsights = (skillKey: string, percentage: number) => {
    const insights = {
      leadership: {
        strong: [
          "You demonstrate clear initiative-taking behavior in conversations",
          "Your communication shows confidence in guiding discussions",
          "You naturally take charge and provide direction to others",
          "Your messages show strong decision-making capabilities"
        ],
        moderate: [
          "You show some leadership qualities but could be more assertive",
          "Your communication indicates potential for stronger leadership",
          "You participate in guiding conversations but could take more initiative"
        ],
        developing: [
          "Focus on taking more initiative in group discussions",
          "Practice making decisive statements and suggestions",
          "Work on confidently expressing your opinions and ideas"
        ]
      },
      collaborative: {
        strong: [
          "Your communication style is highly inclusive and team-oriented",
          "You actively seek input and feedback from others",
          "Your messages show excellent cooperation and support for teammates",
          "You demonstrate strong ability to build consensus"
        ],
        moderate: [
          "You show good teamwork but could engage more with others' ideas",
          "Your collaborative skills are present but could be more prominent",
          "You work well with others but could be more proactive in collaboration"
        ],
        developing: [
          "Practice asking more questions and seeking others' opinions",
          "Focus on building on others' ideas in conversations",
          "Work on creating more inclusive communication patterns"
        ]
      },
      analyticalThinking: {
        strong: [
          "Your communication shows systematic and logical reasoning",
          "You consistently break down complex problems into components",
          "Your messages demonstrate data-driven thinking patterns",
          "You show excellent ability to analyze situations objectively"
        ],
        moderate: [
          "You show analytical skills but could provide more detailed reasoning",
          "Your logical thinking is present but could be more structured",
          "You analyze situations well but could be more systematic"
        ],
        developing: [
          "Practice breaking down problems into smaller components",
          "Focus on providing more evidence-based reasoning",
          "Work on structuring your thoughts more logically"
        ]
      },
      creativity: {
        strong: [
          "Your communication shows innovative and original thinking",
          "You consistently propose creative solutions and alternatives",
          "Your messages demonstrate excellent brainstorming abilities",
          "You show strong ability to think outside conventional boundaries"
        ],
        moderate: [
          "You show creative potential but could explore more innovative ideas",
          "Your creative thinking is present but could be more prominent",
          "You have good ideas but could push boundaries more"
        ],
        developing: [
          "Practice brainstorming multiple solutions to problems",
          "Focus on challenging conventional approaches",
          "Work on expressing more innovative and original ideas"
        ]
      },
      problemSolving: {
        strong: [
          "You excel at identifying root causes and proposing solutions",
          "Your communication shows systematic problem-solving approach",
          "You demonstrate excellent troubleshooting abilities",
          "Your messages show strong solution-oriented thinking"
        ],
        moderate: [
          "You show problem-solving skills but could be more systematic",
          "Your solution-oriented thinking is present but could be stronger",
          "You identify problems well but could propose more solutions"
        ],
        developing: [
          "Practice identifying problems before proposing solutions",
          "Focus on considering multiple solution approaches",
          "Work on following through from problem identification to resolution"
        ]
      }
    };

    const skillInsights = insights[skillKey as keyof typeof insights];
    if (percentage >= 75) return skillInsights.strong;
    if (percentage >= 50) return skillInsights.moderate;
    return skillInsights.developing;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize clusters
    const clusters = new Map<string, SkillCluster>();
    const centerX = size / 2;
    const centerY = size / 2;
    const clusterRadius = size / 3;

    skillEntries.forEach(([skill, value], index) => {
      const angle = (index * 2 * Math.PI) / skillEntries.length;
      
      // Position clusters in a circle
      const clusterCenterX = centerX + Math.cos(angle) * clusterRadius;
      const clusterCenterY = centerY + Math.sin(angle) * clusterRadius;
      
      // Number of nodes based on skill strength (10-50 nodes)
      const nodeCount = Math.floor((value / 100) * 40) + 10;
      const nodes: Node[] = [];
      
      // Create nodes for this cluster
      for (let i = 0; i < nodeCount; i++) {
        const nodeAngle = Math.random() * 2 * Math.PI;
        const nodeDistance = Math.random() * 60;
        const nodeRadius = Math.random() * 4 + 2;
        
        nodes.push({
          x: clusterCenterX + Math.cos(nodeAngle) * nodeDistance,
          y: clusterCenterY + Math.sin(nodeAngle) * nodeDistance,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: nodeRadius,
          opacity: Math.random() * 0.5 + 0.5
        });
      }
      
      // Create connections between nearby nodes
      const connections: Array<{ from: number; to: number; opacity: number }> = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 40 && Math.random() < 0.3) {
            connections.push({
              from: i,
              to: j,
              opacity: Math.random() * 0.3 + 0.1
            });
          }
        }
      }
      
      clusters.set(skill, {
        centerX: clusterCenterX,
        centerY: clusterCenterY,
        nodes,
        connections
      });
    });

    clustersRef.current = clusters;

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      
      // Draw background grid
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < size; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
        ctx.stroke();
      }

      skillEntries.forEach(([skill, value], index) => {
        const cluster = clusters.get(skill);
        if (!cluster) return;

        // Update node positions with gentle floating motion
        cluster.nodes.forEach((node, index) => {
          // Gentle floating motion
          node.vx += (Math.random() - 0.5) * 0.02;
          node.vy += (Math.random() - 0.5) * 0.02;
          
          // Damping
          node.vx *= 0.98;
          node.vy *= 0.98;
          
          // Attraction to cluster center
          const dx = cluster.centerX - node.x;
          const dy = cluster.centerY - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 80) {
            node.vx += dx * 0.001;
            node.vy += dy * 0.001;
          }
          
          node.x += node.vx;
          node.y += node.vy;
          
          // Breathing effect
          node.opacity = 0.5 + Math.sin(time * 0.01 + index * 0.1) * 0.3;
        });

        // Draw connections
        ctx.strokeStyle = 'hsl(' + (index * 137.5) + ', 100%, 50%)';
        cluster.connections.forEach(connection => {
          const fromNode = cluster.nodes[connection.from];
          const toNode = cluster.nodes[connection.to];
          
          ctx.globalAlpha = connection.opacity * 0.4;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();
        });

        // Draw nodes
        cluster.nodes.forEach(node => {
          ctx.globalAlpha = node.opacity;
          ctx.fillStyle = 'hsl(' + (index * 137.5) + ', 100%, 50%)';
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
          ctx.fill();
          
          // Glow effect
          ctx.shadowColor = 'hsl(' + (index * 137.5) + ', 100%, 50%)';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 0.5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        ctx.globalAlpha = 1;

        // Draw cluster label
        ctx.save();
        ctx.translate(cluster.centerX, cluster.centerY - 100);
        
        // Label background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.roundRect(-40, -20, 80, 40, 20);
        ctx.fill();
        
        ctx.strokeStyle = 'hsl(' + (index * 137.5) + ', 100%, 50%)';
        ctx.lineWidth = 2;
        ctx.roundRect(-40, -20, 80, 40, 20);
        ctx.stroke();

        // Skill name and percentage
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#374151';
        ctx.fillText(skill, 0, -5);
        
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillStyle = 'hsl(' + (index * 137.5) + ', 100%, 50%)';
        ctx.fillText(`${value}%`, 0, 10);
        
        ctx.restore();
      });

      time++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [skills, size]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if click is within any cluster
    skillEntries.forEach(([skill, value]) => {
      const cluster = clustersRef.current.get(skill);
      if (!cluster) return;

      const dx = x - cluster.centerX;
      const dy = y - cluster.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 80) {
        setSelectedSkill(skill);
      }
    });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setMousePos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

// ...

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl border border-slate-700 cursor-pointer"
        style={{ background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)' }}
      />
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500 max-w-md">
          Each floating cluster represents a skill. Larger clusters indicate stronger skills.
        </p>
      </div>

      {/* Detailed Skill View Modal */}
      {selectedSkill && (
        <div className="absolute left-1/2 top-10 -translate-x-1/2 z-20 bg-white/90 rounded-2xl shadow-xl border border-gray-200 px-6 py-5 min-w-[300px] animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg text-gray-900 capitalize">{selectedSkill}</span>
            <button
              className="ml-2 p-1 rounded hover:bg-gray-200 text-gray-700"
              onClick={() => setSelectedSkill(null)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl font-bold text-green-600">{skills[selectedSkill]}</span>
            <span className="text-gray-500 font-medium">/ 100</span>
          </div>
          <div>
            {insights && insights.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {insights.map((insight: string, index: number) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-600 text-sm">No insights available for this skill.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}