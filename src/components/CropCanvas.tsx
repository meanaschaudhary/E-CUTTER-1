import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCw,
  Sparkles,
  Grid,
  Square,
  Undo2,
  Redo2,
  RefreshCw,
  Move,
} from 'lucide-react';
import { CropBox, AspectRatioMode } from '../types';

interface CropCanvasProps {
  imageSrc: string;
  cropBox: CropBox;
  rotation: number;
  aspectRatioMode: AspectRatioMode;
  targetWidthMm: number;
  targetHeightMm: number;
  showGrid: boolean;
  showBoundaryGuide: boolean;
  onCropChange: (crop: CropBox) => void;
  onRotate: () => void;
  onAutoDetect: () => void;
  onReset: () => void;
  onToggleGrid: () => void;
  onToggleBoundaryGuide: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

type DragHandle =
  | 'inside'
  | 'tl'
  | 'tr'
  | 'bl'
  | 'br'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | null;

export const CropCanvas: React.FC<CropCanvasProps> = ({
  imageSrc,
  cropBox,
  rotation,
  aspectRatioMode,
  targetWidthMm,
  targetHeightMm,
  showGrid,
  showBoundaryGuide,
  onCropChange,
  onRotate,
  onAutoDetect,
  onReset,
  onToggleGrid,
  onToggleBoundaryGuide,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Viewport transform state (Zoom & Pan)
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging crop box or handles
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    initialCrop: CropBox;
  }>({
    clientX: 0,
    clientY: 0,
    initialCrop: { ...cropBox },
  });

  // Calculate target aspect ratio when locked
  const getLockedAspectRatio = useCallback((): number | null => {
    if (aspectRatioMode === 'cr80') {
      return 86.0 / 54.0; // 1.5926
    }
    if (aspectRatioMode === 'custom' && targetWidthMm && targetHeightMm) {
      return targetWidthMm / targetHeightMm;
    }
    if (aspectRatioMode === 'original' && imageRef.current) {
      return imageRef.current.naturalWidth / imageRef.current.naturalHeight;
    }
    return null; // 'free' mode
  }, [aspectRatioMode, targetWidthMm, targetHeightMm]);

  // Load Image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      fitToScreen();
      redraw();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Redraw canvas on state changes
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imageRef.current;
    if (!canvas || !container || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Compute base image fit
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const containerAspect = width / height;

    let baseW = width * 0.9;
    let baseH = baseW / imgAspect;

    if (baseH > height * 0.9) {
      baseH = height * 0.9;
      baseW = baseH * imgAspect;
    }

    const centerX = width / 2 + pan.x;
    const centerY = height / 2 + pan.y;

    const renderW = baseW * zoom;
    const renderH = baseH * zoom;
    const renderX = centerX - renderW / 2;
    const renderY = centerY - renderH / 2;

    // Draw document image with rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
    ctx.restore();

    // Calculate crop rectangle on canvas screen
    const cropScreenX = renderX + cropBox.x * renderW;
    const cropScreenY = renderY + cropBox.y * renderH;
    const cropScreenW = cropBox.width * renderW;
    const cropScreenH = cropBox.height * renderH;

    // Dark overlay on outside crop area
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    // Top
    ctx.fillRect(0, 0, width, Math.max(0, cropScreenY));
    // Bottom
    ctx.fillRect(
      0,
      cropScreenY + cropScreenH,
      width,
      Math.max(0, height - (cropScreenY + cropScreenH))
    );
    // Left
    ctx.fillRect(
      0,
      cropScreenY,
      Math.max(0, cropScreenX),
      cropScreenH
    );
    // Right
    ctx.fillRect(
      cropScreenX + cropScreenW,
      cropScreenY,
      Math.max(0, width - (cropScreenX + cropScreenW)),
      cropScreenH
    );

    // Draw Grid Overlay
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // 3x3 Grid
      for (let i = 1; i <= 2; i++) {
        const gx = cropScreenX + (cropScreenW / 3) * i;
        ctx.beginPath();
        ctx.moveTo(gx, cropScreenY);
        ctx.lineTo(gx, cropScreenY + cropScreenH);
        ctx.stroke();

        const gy = cropScreenY + (cropScreenH / 3) * i;
        ctx.beginPath();
        ctx.moveTo(cropScreenX, gy);
        ctx.lineTo(cropScreenX + cropScreenW, gy);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Draw Card Boundary Guide
    if (showBoundaryGuide) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropScreenX, cropScreenY, cropScreenW, cropScreenH);
    }

    // Draw Crop Box Outline
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cropScreenX, cropScreenY, cropScreenW, cropScreenH);

    // Draw Corner & Edge Handles
    const handleSize = 12;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;

    const handles: Array<{ x: number; y: number; cursor: string }> = [
      { x: cropScreenX, y: cropScreenY, cursor: 'nwse-resize' }, // TL
      { x: cropScreenX + cropScreenW / 2, y: cropScreenY, cursor: 'ns-resize' }, // Top
      { x: cropScreenX + cropScreenW, y: cropScreenY, cursor: 'nesw-resize' }, // TR
      { x: cropScreenX + cropScreenW, y: cropScreenY + cropScreenH / 2, cursor: 'ew-resize' }, // Right
      { x: cropScreenX + cropScreenW, y: cropScreenY + cropScreenH, cursor: 'nwse-resize' }, // BR
      { x: cropScreenX + cropScreenW / 2, y: cropScreenY + cropScreenH, cursor: 'ns-resize' }, // Bottom
      { x: cropScreenX, y: cropScreenY + cropScreenH, cursor: 'nesw-resize' }, // BL
      { x: cropScreenX, y: cropScreenY + cropScreenH / 2, cursor: 'ew-resize' }, // Left
    ];

    handles.forEach((h) => {
      ctx.fillRect(
        h.x - handleSize / 2,
        h.y - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.strokeRect(
        h.x - handleSize / 2,
        h.y - handleSize / 2,
        handleSize,
        handleSize
      );
    });

    // Real-time Dimension Tag Pill
    const tagText = `${targetWidthMm} × ${targetHeightMm} mm (${Math.round(cropBox.width * img.naturalWidth)} × ${Math.round(cropBox.height * img.naturalHeight)} px)`;
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    const textMetrics = ctx.measureText(tagText);
    const tagW = textMetrics.width + 16;
    const tagH = 24;
    const tagX = cropScreenX + cropScreenW / 2 - tagW / 2;
    const tagY = cropScreenY - 32 > 10 ? cropScreenY - 32 : cropScreenY + 10;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, tagW, tagH, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(tagText, tagX + 8, tagY + 16);
  }, [
    cropBox,
    rotation,
    zoom,
    pan,
    showGrid,
    showBoundaryGuide,
    targetWidthMm,
    targetHeightMm,
  ]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Window resize observer
  useEffect(() => {
    const handleResize = () => redraw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redraw]);

  // Transform coordinates helper
  const getRenderDimensions = () => {
    const container = containerRef.current;
    const img = imageRef.current;
    if (!container || !img) return null;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const imgAspect = img.naturalWidth / img.naturalHeight;

    let baseW = width * 0.9;
    let baseH = baseW / imgAspect;
    if (baseH > height * 0.9) {
      baseH = height * 0.9;
      baseW = baseH * imgAspect;
    }

    const centerX = width / 2 + pan.x;
    const centerY = height / 2 + pan.y;
    const renderW = baseW * zoom;
    const renderH = baseH * zoom;
    const renderX = centerX - renderW / 2;
    const renderY = centerY - renderH / 2;

    return { renderX, renderY, renderW, renderH, width, height };
  };

  // Determine which handle was clicked
  const getHandleAt = (clientX: number, clientY: number): DragHandle => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const dims = getRenderDimensions();
    if (!dims) return null;

    const { renderX, renderY, renderW, renderH } = dims;
    const cropScreenX = renderX + cropBox.x * renderW;
    const cropScreenY = renderY + cropBox.y * renderH;
    const cropScreenW = cropBox.width * renderW;
    const cropScreenH = cropBox.height * renderH;

    const hit = 18; // tolerance in px

    // Check corners first
    if (Math.abs(mx - cropScreenX) < hit && Math.abs(my - cropScreenY) < hit) return 'tl';
    if (Math.abs(mx - (cropScreenX + cropScreenW)) < hit && Math.abs(my - cropScreenY) < hit) return 'tr';
    if (Math.abs(mx - cropScreenX) < hit && Math.abs(my - (cropScreenY + cropScreenH)) < hit) return 'bl';
    if (Math.abs(mx - (cropScreenX + cropScreenW)) < hit && Math.abs(my - (cropScreenY + cropScreenH)) < hit) return 'br';

    // Check edges
    if (Math.abs(my - cropScreenY) < hit && mx >= cropScreenX && mx <= cropScreenX + cropScreenW) return 'top';
    if (Math.abs(my - (cropScreenY + cropScreenH)) < hit && mx >= cropScreenX && mx <= cropScreenX + cropScreenW) return 'bottom';
    if (Math.abs(mx - cropScreenX) < hit && my >= cropScreenY && my <= cropScreenY + cropScreenH) return 'left';
    if (Math.abs(mx - (cropScreenX + cropScreenW)) < hit && my >= cropScreenY && my <= cropScreenY + cropScreenH) return 'right';

    // Check inside
    if (
      mx > cropScreenX &&
      mx < cropScreenX + cropScreenW &&
      my > cropScreenY &&
      my < cropScreenY + cropScreenH
    ) {
      return 'inside';
    }

    return null;
  };

  // Mouse & Pointer handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.altKey) {
      // Middle click or Alt key for panning
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    const handle = getHandleAt(e.clientX, e.clientY);
    if (handle) {
      setActiveHandle(handle);
      dragStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        initialCrop: { ...cropBox },
      };
    } else {
      // Clicked outside -> pan the view
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    if (!activeHandle) {
      // Update cursor
      const handle = getHandleAt(e.clientX, e.clientY);
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (handle === 'inside') canvas.style.cursor = 'move';
      else if (handle === 'tl' || handle === 'br') canvas.style.cursor = 'nwse-resize';
      else if (handle === 'tr' || handle === 'bl') canvas.style.cursor = 'nesw-resize';
      else if (handle === 'top' || handle === 'bottom') canvas.style.cursor = 'ns-resize';
      else if (handle === 'left' || handle === 'right') canvas.style.cursor = 'ew-resize';
      else canvas.style.cursor = 'default';
      return;
    }

    const dims = getRenderDimensions();
    if (!dims) return;

    const { renderW, renderH } = dims;
    const deltaX = (e.clientX - dragStartRef.current.clientX) / renderW;
    const deltaY = (e.clientY - dragStartRef.current.clientY) / renderH;
    const init = dragStartRef.current.initialCrop;

    let newCrop = { ...init };
    const ratio = getLockedAspectRatio();
    const imgAspect = imageRef.current
      ? imageRef.current.naturalWidth / imageRef.current.naturalHeight
      : 1;

    if (activeHandle === 'inside') {
      newCrop.x = Math.max(0, Math.min(1 - init.width, init.x + deltaX));
      newCrop.y = Math.max(0, Math.min(1 - init.height, init.y + deltaY));
    } else if (activeHandle === 'br') {
      newCrop.width = Math.max(0.05, Math.min(1 - init.x, init.width + deltaX));
      if (ratio) {
        newCrop.height = (newCrop.width * imgAspect) / ratio;
      } else {
        newCrop.height = Math.max(0.05, Math.min(1 - init.y, init.height + deltaY));
      }
    } else if (activeHandle === 'tl') {
      const maxDx = init.width - 0.05;
      const maxDy = init.height - 0.05;
      const appliedDx = Math.max(-init.x, Math.min(maxDx, deltaX));
      const appliedDy = Math.max(-init.y, Math.min(maxDy, deltaY));

      newCrop.x = init.x + appliedDx;
      newCrop.width = init.width - appliedDx;
      newCrop.y = init.y + appliedDy;
      newCrop.height = init.height - appliedDy;

      if (ratio) {
        newCrop.height = (newCrop.width * imgAspect) / ratio;
      }
    } else if (activeHandle === 'tr') {
      newCrop.width = Math.max(0.05, Math.min(1 - init.x, init.width + deltaX));
      const maxDy = init.height - 0.05;
      const appliedDy = Math.max(-init.y, Math.min(maxDy, deltaY));
      newCrop.y = init.y + appliedDy;
      newCrop.height = init.height - appliedDy;

      if (ratio) {
        newCrop.height = (newCrop.width * imgAspect) / ratio;
      }
    } else if (activeHandle === 'bl') {
      const maxDx = init.width - 0.05;
      const appliedDx = Math.max(-init.x, Math.min(maxDx, deltaX));
      newCrop.x = init.x + appliedDx;
      newCrop.width = init.width - appliedDx;
      newCrop.height = Math.max(0.05, Math.min(1 - init.y, init.height + deltaY));

      if (ratio) {
        newCrop.height = (newCrop.width * imgAspect) / ratio;
      }
    } else if (activeHandle === 'right') {
      newCrop.width = Math.max(0.05, Math.min(1 - init.x, init.width + deltaX));
      if (ratio) {
        newCrop.height = (newCrop.width * imgAspect) / ratio;
      }
    } else if (activeHandle === 'bottom') {
      newCrop.height = Math.max(0.05, Math.min(1 - init.y, init.height + deltaY));
      if (ratio) {
        newCrop.width = (newCrop.height * ratio) / imgAspect;
      }
    } else if (activeHandle === 'left') {
      const maxDx = init.width - 0.05;
      const appliedDx = Math.max(-init.x, Math.min(maxDx, deltaX));
      newCrop.x = init.x + appliedDx;
      newCrop.width = init.width - appliedDx;
      if (ratio) {
        newCrop.height = (newCrop.width * imgAspect) / ratio;
      }
    } else if (activeHandle === 'top') {
      const maxDy = init.height - 0.05;
      const appliedDy = Math.max(-init.y, Math.min(maxDy, deltaY));
      newCrop.y = init.y + appliedDy;
      newCrop.height = init.height - appliedDy;
      if (ratio) {
        newCrop.width = (newCrop.height * ratio) / imgAspect;
      }
    }

    // Boundary clamp
    newCrop.x = Math.max(0, Math.min(0.95, newCrop.x));
    newCrop.y = Math.max(0, Math.min(0.95, newCrop.y));
    newCrop.width = Math.max(0.05, Math.min(1 - newCrop.x, newCrop.width));
    newCrop.height = Math.max(0.05, Math.min(1 - newCrop.y, newCrop.height));

    onCropChange(newCrop);
  };

  const handleMouseUp = () => {
    setActiveHandle(null);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.max(0.4, Math.min(4.0, prev * zoomFactor)));
  };

  const zoomIn = () => setZoom((prev) => Math.min(4.0, prev * 1.25));
  const zoomOut = () => setZoom((prev) => Math.max(0.4, prev / 1.25));

  const fitToScreen = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const fitToCrop = () => {
    const container = containerRef.current;
    if (!container || !imageRef.current) return;
    const targetZoom = Math.min(2.5, 0.8 / Math.max(cropBox.width, cropBox.height));
    setZoom(targetZoom);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-950 rounded-2xl overflow-hidden shadow-sm border border-gray-800">
      {/* Top Overlay Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Undo / Redo & Mode Pill */}
        <div className="flex items-center gap-1 bg-gray-900/90 backdrop-blur-md border border-gray-700/80 p-1 rounded-xl shadow-lg pointer-events-auto">
          <button
            id="btn-crop-undo"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            id="btn-crop-redo"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-gray-700 mx-1" />
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
            {aspectRatioMode} Ratio
          </span>
        </div>

        {/* View & Automation Actions */}
        <div className="flex items-center gap-1 bg-gray-900/90 backdrop-blur-md border border-gray-700/80 p-1 rounded-xl shadow-lg pointer-events-auto">
          <button
            id="btn-auto-crop"
            onClick={onAutoDetect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-sky-300 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-700/60 transition-colors shadow-xs"
            title="Auto detect document & card edges"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Auto Detect</span>
          </button>

          <button
            id="btn-rotate-card"
            onClick={onRotate}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            id="btn-toggle-grid"
            onClick={onToggleGrid}
            className={`p-1.5 rounded-lg transition-colors ${
              showGrid
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            title="Toggle Rule-of-Thirds Grid Overlay"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            id="btn-toggle-boundary"
            onClick={onToggleBoundaryGuide}
            className={`p-1.5 rounded-lg transition-colors ${
              showBoundaryGuide
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            title="Toggle Card Boundary Box"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            id="btn-reset-crop"
            onClick={onReset}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            title="Reset Crop to Center"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full relative cursor-crosshair bg-gray-950 overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      {/* Bottom Floating Zoom & Pan Controls */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-gray-900/90 backdrop-blur-md border border-gray-700/80 px-2.5 py-1.5 rounded-xl shadow-lg">
        <button
          onClick={zoomOut}
          className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono text-gray-300 font-semibold px-1">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-gray-700 mx-1" />

        <button
          onClick={fitToScreen}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          title="Fit Document to Screen"
        >
          <Maximize className="w-3.5 h-3.5" />
          <span>Fit Screen</span>
        </button>

        <button
          onClick={fitToCrop}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          title="Focus on Selected Card Region"
        >
          <Move className="w-3.5 h-3.5" />
          <span>Fit Card</span>
        </button>
      </div>
    </div>
  );
};
