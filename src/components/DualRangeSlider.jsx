import React, { useState, useEffect } from "react";

export default function DualRangeSlider({ value = [0, 50000], onChange, min = 0, max = 50000, step = 500 }) {
  const [localRange, setLocalRange] = useState(value);

  useEffect(() => {
    setLocalRange(value);
  }, [value]);

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), localRange[1]);
    setLocalRange([val, localRange[1]]);
  };

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), localRange[0]);
    setLocalRange([localRange[0], val]);
  };

  const handleMouseUp = () => onChange([...localRange]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="number"
          value={localRange[0]}
          onChange={handleMinChange}
          onBlur={handleMouseUp}
          className="w-1/2 px-2 py-1 border rounded text-sm"
        />
        <span className="text-zinc-500">–</span>
        <input
          type="number"
          value={localRange[1]}
          onChange={handleMaxChange}
          onBlur={handleMouseUp}
          className="w-1/2 px-2 py-1 border rounded text-sm"
        />
      </div>

      <div className="relative h-3 mt-2">
        <div className="absolute w-full h-1 bg-zinc-200 rounded" />
        <div
          className="absolute h-1 bg-zinc-900 rounded"
          style={{
            left: `${((localRange[0] - min) / (max - min)) * 100}%`,
            width: `${((localRange[1] - localRange[0]) / (max - min)) * 100}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localRange[0]}
          onChange={handleMinChange}
          onMouseUp={handleMouseUp}
          className="absolute w-full h-3 bg-transparent appearance-none pointer-events-auto"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localRange[1]}
          onChange={handleMaxChange}
          onMouseUp={handleMouseUp}
          className="absolute w-full h-3 bg-transparent appearance-none pointer-events-auto"
        />
      </div>

      <div className="text-xs text-zinc-500">
        R {localRange[0].toLocaleString()} – R {localRange[1].toLocaleString()}
      </div>
    </div>
  );
}