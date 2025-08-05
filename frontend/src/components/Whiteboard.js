import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  HStack,
  Button,
  Icon,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FaPen, FaEraser, FaUndo, FaRedo, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Whiteboard = ({ liveClassId, isInstructor }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { token } = useAuth();
  const toast = useToast();
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set initial styles
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Save initial state
    saveToHistory();
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  };

  const startDrawing = (e) => {
    if (!isInstructor) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !isInstructor) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
      updateWhiteboardOnServer();
    }
  };

  const updateWhiteboardOnServer = async () => {
    try {
      const canvas = canvasRef.current;
      const elements = []; // In a real implementation, you'd track drawing elements
      
      const response = await fetch(`/api/live-classes/${liveClassId}/whiteboard`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ elements }),
      });
      
      if (!response.ok) {
        console.error('Failed to update whiteboard');
      }
    } catch (error) {
      console.error('Error updating whiteboard:', error);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
    updateWhiteboardOnServer();
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      loadFromHistory(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      loadFromHistory(historyIndex + 1);
    }
  };

  const loadFromHistory = (index) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    
    img.src = history[index];
  };

  const changeTool = (newTool) => {
    setTool(newTool);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (newTool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = brushSize * 2;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
  };

  const changeColor = (newColor) => {
    setColor(newColor);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = newColor;
  };

  const changeBrushSize = (size) => {
    setBrushSize(size);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = size;
  };

  return (
    <Box h="full" bg={bg} border="1px" borderColor={borderColor} rounded="lg">
      {/* Toolbar */}
      <HStack spacing={2} p={2} borderBottom="1px" borderColor={borderColor}>
        <Button
          size="sm"
          variant={tool === 'pen' ? 'solid' : 'outline'}
          colorScheme="teal"
          onClick={() => changeTool('pen')}
          isDisabled={!isInstructor}
        >
          <Icon as={FaPen} />
        </Button>
        <Button
          size="sm"
          variant={tool === 'eraser' ? 'solid' : 'outline'}
          colorScheme="teal"
          onClick={() => changeTool('eraser')}
          isDisabled={!isInstructor}
        >
          <Icon as={FaEraser} />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={undo}
          isDisabled={!isInstructor || historyIndex <= 0}
        >
          <Icon as={FaUndo} />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={redo}
          isDisabled={!isInstructor || historyIndex >= history.length - 1}
        >
          <Icon as={FaRedo} />
        </Button>
        <Button
          size="sm"
          variant="outline"
          colorScheme="red"
          onClick={clearCanvas}
          isDisabled={!isInstructor}
        >
          <Icon as={FaTrash} />
        </Button>
        
        {/* Color Picker */}
        <input
          type="color"
          value={color}
          onChange={(e) => changeColor(e.target.value)}
          style={{ width: '30px', height: '30px', cursor: 'pointer' }}
          disabled={!isInstructor}
        />
        
        {/* Brush Size */}
        <select
          value={brushSize}
          onChange={(e) => changeBrushSize(Number(e.target.value))}
          disabled={!isInstructor}
          style={{ padding: '4px', borderRadius: '4px' }}
        >
          <option value={1}>1px</option>
          <option value={2}>2px</option>
          <option value={5}>5px</option>
          <option value={10}>10px</option>
        </select>
      </HStack>

      {/* Canvas */}
      <Box flex={1} p={2}>
        <canvas
          ref={canvasRef}
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: isInstructor ? 'crosshair' : 'default',
            width: '100%',
            height: '100%',
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </Box>
    </Box>
  );
};

export default Whiteboard; 