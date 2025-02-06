import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const Settings = () => {
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [columnWidths, setColumnWidths] = useState({
    firstColumn: 0.5, // 50%
    secondColumn: 0.5, // 50%
  });
  
  const theme = useTheme(); // Get the current theme from context
  
  // Update the width of the columns on resize
  const handleResizeStop = (key) => (e, data) => {
    const percentageWidth = (data.size.width / window.innerWidth) * 100;
    console.log(`Previous width of ${key}: ${columnWidths[key]}%`);
    console.log(`New width of ${key}: ${percentageWidth}%`);
    
    setColumnWidths((prevWidths) => ({
      ...prevWidths,
      [key]: percentageWidth, // Update with percentage instead of pixels
    }));
  };

  useEffect(() => {
    console.log(`Window width: ${window.innerWidth}`);
  }, []);
  

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100vh', backgroundColor: theme.palette.background.primary }}>
      
      {/* First resizable column */}
      <ResizableBox
        width={columnWidths.firstColumn * window.innerWidth} // Convert percentage to pixels
        height="100%" 
        axis="x"
        minConstraints={[100, 10]} // Min width of 100px
        maxConstraints={[window.innerWidth * 0.8, 1000]} // Max width of 80% of screen
        onResize={handleResizeStop('firstColumn')}
        resizeHandles={['e']} // Allow resizing from the right
      >
        <Box sx={{ backgroundColor: theme.palette.background.default, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <p>Placeholder 1</p>
        </Box>
      </ResizableBox>
  
      {/* Vertical divider */}
      <div style={{ width: '5px', cursor: 'col-resize', backgroundColor: theme.palette.grey[400] }} />
  
      {/* Second resizable column */}
      <ResizableBox
        width={columnWidths.secondColumn * window.innerWidth} // Convert percentage to pixels
        height="100%"
        axis="x"
        minConstraints={[100, 10]} // Min width of 100px
        maxConstraints={[window.innerWidth * 0.8, 1000]} // Max width of 80% of screen
        onResize={handleResizeStop('secondColumn')}
        resizeHandles={['e']}
      >
        <Box sx={{ backgroundColor: theme.palette.background.default, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <p>Placeholder 2</p>
        </Box>
      </ResizableBox>
    </Box>
  );
};

export default Settings;
