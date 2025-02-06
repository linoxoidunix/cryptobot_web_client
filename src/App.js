import React, { createContext, useContext, useState } from "react";
import {
  Tabs,
  Tab,
  Button,
  Box,
} from "@mui/material";
import { ThemeContext } from "./ThemeContext";
import subscriptionService from "./subscriptionService";
import OrderBook from "./OrderBook.js";
import Wallet from "./Wallet";
import Pnl from "./Pnl";
import Trade from "./Trade";
import Settings from "./Settings";


const SubscriptionContext = createContext();

export const useSubscription = () => useContext(SubscriptionContext);

const App = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [tabValue, setTabValue] = useState(0);
 
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <SubscriptionContext.Provider value={subscriptionService}>
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.background.primary,
          padding: 2,
        }}
      >
        {/* Переключение темы */}
        <Button
          variant="contained"
          onClick={toggleTheme}
          style={{ marginBottom: "20px" }}
        >
          {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </Button>

        {/* Вкладки */}
        <Tabs value={tabValue} onChange={handleChangeTab} centered>
          <Tab label="OrderBook" />
          <Tab label="PnL" />
          <Tab label="Wallet" />
          <Tab label="Trade" />
          <Tab label="Settings" />
        </Tabs>

      {/* Содержимое вкладок */}
              {/* Все компоненты монтируются сразу, но скрыты с помощью display: none */}
              <Box
          sx={{
            display: tabValue === 0 ? "block" : "none", // Для активной вкладки показываем компонент
            height: "100vh",  // Пример высоты для вкладки
            // position: "absolute", // Скрытые вкладки не влияют на layout
          }}
        >
          <OrderBook />
        </Box>

        <Box
          sx={{
            display: tabValue === 1 ? "block" : "none",
            height: "100vh",  // Пример высоты для вкладки

            // position: "absolute",
          }}
        >
          <Pnl />
        </Box>
        
        <Box
          sx={{
            display: tabValue === 2 ? "block" : "none",
            height: "100vh",  // Пример высоты для вкладки
          }}
        >
          <Wallet />
        </Box>

        <Box
          sx={{
            display: tabValue === 3 ? "block" : "none",
            height: "100vh",  // Пример высоты для вкладки

          }}
        >
          <Trade />
        </Box>

        <Box
          sx={{
            display: tabValue === 4 ? "block" : "none",
            height: "100vh",  // Пример высоты для вкладки

          }}
        >
            <Settings />
          </Box>
        </Box>
    </SubscriptionContext.Provider>
  );
};

export default App;

//----------------------------------------------------------------
// import React from 'react';
// import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

// function App() {
//   return (
//     <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
//       <PanelGroup direction="horizontal" style={{ flexGrow: 1 }}>
//         {/* Панель 1 */}
//         <Panel>
//           <div style={{ padding: '20px' }}>Панель 1</div>
//         </Panel>

//         {/* Разделитель с кастомными стилями */}
//         <PanelResizeHandle>
//           <div
//             style={{
//               background: '#aaa', // Цвет разделителя
//               cursor: 'ew-resize', // Курсор изменения размера
//               width: '4px', // Ширина разделителя
//               height: '100%', // Разделитель будет растянут на всю высоту
//             }}
//           />
//         </PanelResizeHandle>

//         {/* Панель 2 */}
//         <Panel>
//           <div style={{ padding: '20px' }}>Панель 2</div>
//         </Panel>

//         {/* Еще один разделитель */}
//         <PanelResizeHandle>
//           <div
//             style={{
//               background: '#aaa', // Цвет разделителя
//               cursor: 'ew-resize', // Курсор изменения размера
//               width: '4px', // Ширина разделителя
//               height: '100%', // Разделитель будет растянут на всю высоту
//             }}
//           />
//         </PanelResizeHandle>

//         {/* Панель 3 */}
//         <Panel>
//           <div style={{ padding: '20px' }}>Панель 3</div>
//         </Panel>
//       </PanelGroup>
//     </div>
//   );
// }

// export default App;










