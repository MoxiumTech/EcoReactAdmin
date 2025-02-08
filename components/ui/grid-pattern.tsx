"use client";

import { useState, useEffect } from 'react';

interface ParticleProps {
  startPosition: { x: number; y: number };
  duration?: number;
}

const Particle = ({ startPosition, duration = 3000 }: ParticleProps) => {
  const [position, setPosition] = useState(startPosition);
  
  useEffect(() => {
    const animate = () => {
      setPosition({
        x: Math.random() * 100,
        y: Math.random() * 100
      });
    };

    animate();
    const interval = setInterval(animate, duration);
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <circle
      cx={`${position.x}%`}
      cy={`${position.y}%`}
      r="4"
      className="animate-pulse"
      filter="url(#glow)"
    >
      <animate
        attributeName="opacity"
        values="0;1;0"
        dur={`${duration}ms`}
        repeatCount="indefinite"
      />
    </circle>
  );
};

export function GridPattern({
  width = 100,
  height = 100,
  className = "",
  particleCount = 5,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  width?: number
  height?: number
  particleCount?: number
}) {
  const [offset, setOffset] = useState(0);
  const patternId = "grid-pattern";
  
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    startPosition: {
      x: Math.random() * 100,
      y: Math.random() * 100
    },
    duration: 2000 + Math.random() * 2000
  }));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => (prev + 1) % 24);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <svg
      width={width}
      height={height}
      className={className}
      {...props}
      style={{
        ...props.style,
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        height: "100%"
      }}
    >
      <defs>
        <pattern
          id={patternId}
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(0.5) translate(${offset},${offset})`}
        >
          <path
            d="M0 0h24v1H0zm0 11h24v1H0z"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path
            d="M0 0h1v24H0zm11 0h1v24h-1z"
            fill="currentColor"
            fillOpacity="0.2"
          />
        </pattern>

        {/* Glow effect filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Base grid */}
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />

      {/* Particles */}
      <g className="text-blue-400">
        {particles.map((particle) => (
          <Particle
            key={particle.id}
            startPosition={particle.startPosition}
            duration={particle.duration}
          />
        ))}
      </g>
    </svg>
  );
}

export function DiagonalLines({
  width = 100,
  height = 100,
  className = "",
  ...props
}: React.SVGProps<SVGSVGElement> & {
  width?: number
  height?: number
}) {
  const [rotation, setRotation] = useState(45);
  const patternId = "diagonal-pattern";
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <svg
      width={width}
      height={height}
      className={className}
      {...props}
      style={{
        ...props.style,
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        height: "100%"
      }}
    >
      <defs>
        <pattern
          id={patternId}
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${rotation})`}
        >
          <line
            x1="0"
            y1="8"
            x2="16"
            y2="8"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export function DottedPattern({
  width = 100,
  height = 100,
  className = "",
  ...props
}: React.SVGProps<SVGSVGElement> & {
  width?: number
  height?: number
}) {
  const [scale, setScale] = useState(1);
  const patternId = "dots-pattern";
  
  useEffect(() => {
    const interval = setInterval(() => {
      setScale(prev => prev === 1 ? 1.5 : 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <svg
      width={width}
      height={height}
      className={className}
      {...props}
      style={{
        ...props.style,
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        height: "100%"
      }}
    >
      <defs>
        <pattern
          id={patternId}
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${scale})`}
        >
          <circle
            cx="2"
            cy="2"
            r="1"
            fill="currentColor"
            fillOpacity="0.1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}