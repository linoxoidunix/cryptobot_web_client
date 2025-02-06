import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useSubscription } from "./App";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const Trade = () => {
  const [selectedTrade, setSelectedTrade] = useState(null); // Храним индекс выбранного трейда
  const [selectedTradeData, setSelectedTradeData] = useState(null); // Данные о выбранном трейде
  const [rows, setRows] = useState([]);

  const handleToggle = (uid_trade, index, record) => {
    console.log("Current selectedTrade:", selectedTrade);
    console.log("Toggled uid_trade:", uid_trade, "Toggled index:", index);

    // Используем обновление состояния через функцию обратного вызова
    setSelectedTrade((prevSelectedTrade) => {
      const isSelected =
        prevSelectedTrade?.uid_trade === uid_trade &&
        prevSelectedTrade?.index === index;

      const newSelectedTrade = isSelected ? null : { uid_trade, index };
      console.log("New selectedTrade:", newSelectedTrade);

      // Возвращаем новый selectedTrade
      return newSelectedTrade;
    });

    // Сохраняем данные о трейде в selectedTradeData
    setSelectedTradeData(record);
  };

  useEffect(() => {
    // Если данные обновляются или изменяются, можно перезаписать строки
    if (selectedTrade && selectedTradeData) {
      // Очищаем строки перед добавлением нового элемента
      setRows([]);

      setRows((prevRows) => [
        ...prevRows,
        {
          id: `${selectedTrade.uid_trade}-${selectedTrade.index}`, // Unique id based on trade UID and index
          buyEnter: selectedTradeData.buy_input,
          buyExit: selectedTradeData.buy_exit,
          sellEnter: selectedTradeData.sell_input,
          sellExit: selectedTradeData.sell_exit,
          positionEnter: selectedTradeData.position_open,
          positionExit: selectedTradeData.position_exit, // Это было пропущено в вашем коде
          timeOpen: selectedTradeData.time_open,
          timeClose: selectedTradeData.time_close,
          window: selectedTradeData.time_close - selectedTradeData.time_open,
          lastUpdate: selectedTradeData.lastUpdate,
        },
      ]);
    } else {
      // Очищаем строки перед добавлением нового элемента
      setRows([]);
    }
  }, [selectedTrade, selectedTradeData]); // Когда выбранный трейд или данные изменяются, обновляем строки

  const [trade, setTrade] = useState([]);
  const theme = useTheme(); // Get the current theme from context
  const subscriptionService = useSubscription();

  const [columnWidths, setColumnWidths] = useState({
    firstColumn: 0.3, // 30%
    secondColumn: 0.3, // 30%
    thirdColumn: 0.4, // 40%
  });

  const columns = [
    { field: "exchange", headerName: "Exchange", width: 150 },
    { field: "marketType", headerName: "Market Type", width: 150 },
    { field: "pair", headerName: "Trading Pair", width: 150 },
    { field: "buyEnter", headerName: "Buy Enter", width: 150 },
    { field: "buyExit", headerName: "Buy Exit", width: 150 },
    { field: "sellEnter", headerName: "Sell Enter", width: 150 },
    { field: "sellExit", headerName: "Sell Exit", width: 150 },
    { field: "positionEnter", headerName: "Position Enter", width: 150 },
    { field: "positionExit", headerName: "Position Exit", width: 150 },
    { field: "timeOpen", headerName: "Time Open, ns", width: 150 },
    { field: "timeClose", headerName: "Time Close, ns", width: 150 },
    { field: "window", headerName: "Window, ns", width: 150 },
    { field: "lastUpdate", headerName: "Last Update", width: 180 },
  ];

  useEffect(() => {
    const handleUpdate = (data) => {
      console.log("Received data:", data); // Проверим, что данные приходят
      const {
        uid_trade,
        time_open,
        time_close,
        position_open,
        delta,
        buy_input,
        sell_input,
        buy_exit,
        sell_exit,
      } = data || {};
      const currentTime = new Date().toLocaleString();
      if (uid_trade) {
        setTrade((prev) => {
          const existingContainer = prev.find(
            (container) => container.uid_trade === uid_trade
          );

          if (existingContainer) {
            // Determine the next index based on the last record or start from 0
            const nextIndex = existingContainer.records.length
              ? existingContainer.records[existingContainer.records.length - 1]
                  .index + 1
              : 0;

            // Update existing container
            const updatedRecords = [
              ...existingContainer.records, // Keep last 9 records
              {
                time_open,
                time_close,
                position_open,
                delta,
                buy_input,
                sell_input,
                buy_exit,
                sell_exit,
                lastUpdate: currentTime,
                index: nextIndex, // Add the index field
              },
            ].slice(-10); // Keep last 10 trades;

            return prev.map((container) =>
              container.uid_trade === uid_trade
                ? { ...container, records: updatedRecords }
                : container
            );
          }

          // Create new container if uid_trade doesn't exist
          return [
            ...prev,
            {
              uid_trade,
              records: [
                {
                  time_open,
                  time_close,
                  position_open,
                  delta,
                  buy_input,
                  sell_input,
                  buy_exit,
                  sell_exit,
                  lastUpdate: currentTime,
                  index: 0,
                },
              ],
            },
          ];
        });
      }
    };

    console.log("Subscribing to trade...");
    subscriptionService.subscribe("trade", handleUpdate);

    return () => {
      console.log("Unsubscribing from trade...");
      subscriptionService.unsubscribe("trade", handleUpdate); // Clean up on unmount
    };
  }, [subscriptionService]);

  // Функция для отображения трейдов по uid_trade
  const renderTradeContainers = () => {
    return trade.map((container) => (
      <Box key={container.uid_trade} sx={{ marginBottom: 2 }}>
        <Typography variant="h6">UID Trade: {container.uid_trade}</Typography>
        <List dense>
          {container.records.map((record, index) => (
            <ListItem
              key={record.index}
              sx={{
                pl: 4,
                cursor: "pointer", // Курсор указателя при наведении
                border:
                  selectedTrade?.uid_trade === container.uid_trade &&
                  selectedTrade?.index === record.index
                    ? "2px solid #1976d2"
                    : "none", // Прямоугольник для выделенного элемента
                backgroundColor:
                  selectedTrade?.uid_trade === container.uid_trade &&
                  selectedTrade?.index === record.index
                    ? "#e3f2fd"
                    : "transparent", // Фон для выделенного элемента
                padding: "8px", // Padding для лучшего визуального восприятия
                borderRadius: "4px", // Скругленные углы
              }}
              onClick={() =>
                handleToggle(container.uid_trade, record.index, record)
              } // Обработчик клика
            >
              <ListItemText
                primary={`Trade ${record.index + 1} (Index: ${record.index})`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    ));
  };

  const DictionaryTable = ({ rows, columns }) => {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="dictionary table">
          <TableBody>
            {columns.map((col, colIndex) => (
              <TableRow key={colIndex}>
                {rows.map((row, rowIndex) => (
                  <>
                    <TableCell key={`${rowIndex}-${colIndex}-header`}>
                      <Typography variant="subtitle2" component="div">
                        {col.headerName}:
                      </Typography>
                    </TableCell>
                    <TableCell key={`${rowIndex}-${colIndex}-value`}>
                      <Typography variant="body2" component="div">
                        {/* Используем доступ к данным по ключу, аналогичному вашему описанию */}
                        {row[col.field] || "-"}
                      </Typography>
                    </TableCell>
                  </>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100vh",
        backgroundColor: theme.palette.background.primary,
      }}
    >
      <PanelGroup direction="horizontal" style={{ flexGrow: 1 }}>
        {/* Панель 1 */}
        <Panel>
          <Box sx={{ padding: "20px", height: "100%", overflowY: "auto" }}>
            {renderTradeContainers()}
          </Box>
        </Panel>

        {/* Разделитель с кастомными стилями */}
        <PanelResizeHandle>
          <div
            style={{
              background: "#aaa", // Цвет разделителя
              cursor: "ew-resize", // Курсор изменения размера
              width: "4px", // Ширина разделителя
              height: "100%", // Разделитель будет растянут на всю высоту
            }}
          />
        </PanelResizeHandle>

        {/* Панель 2 */}
        <Panel>
          <div style={{ padding: "20px" }}>Панель 2</div>
        </Panel>

        {/* Еще один разделитель */}
        <PanelResizeHandle>
          <div
            style={{
              background: "#aaa", // Цвет разделителя
              cursor: "ew-resize", // Курсор изменения размера
              width: "4px", // Ширина разделителя
              height: "100%", // Разделитель будет растянут на всю высоту
            }}
          />
        </PanelResizeHandle>

        {/* Панель 3 */}
        <Panel>
          <Box
            sx={{
              backgroundColor: theme.palette.background.default,
              padding: 2,
              height: "100%",
            }}
          >
            <DictionaryTable rows={rows} columns={columns} />
          </Box>
        </Panel>
      </PanelGroup>
    </Box>
  );
};

export default Trade;
