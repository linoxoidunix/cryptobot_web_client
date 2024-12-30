const wsUrl = 'ws://localhost:10999/ws';
let ws;
let clients = [];
console.log('in shared worker');  // Логируем начало работы порта для клиента

onconnect = (e) => {
  console.log('shared_worker on connect');
  const port = e.ports[0];
  clients.push(port);
  console.log(`New client connected. Total clients: ${clients.length}`);  // Логируем подключение клиента

  // Обработчик сообщений от клиента
  port.onmessage = (event) => {
    const { action, key } = event.data;
    console.log(`Received message from client: action = ${action}, key = ${key}`); // Логируем полученное сообщение

    if (action === "subscribe") {
      console.log(`Client subscribed to ${key}`);
      
      // Сохраняем подписку на ключ для этого клиента
      if (!port.subscriptions) {
        port.subscriptions = [];
      }

      port.subscriptions.push(key);
      console.log(`Client subscriptions: ${port.subscriptions}`);  // Логируем подписки клиента
    }

    if (action === "unsubscribe") {
      console.log(`Client unsubscribed from ${key}`);
      
      // Удаляем подписку
      if (port.subscriptions) {
        port.subscriptions = port.subscriptions.filter(subscription => subscription !== key);
      }
      console.log(`Updated client subscriptions: ${port.subscriptions}`);  // Логируем обновленные подписки клиента
    }
  };

  if (!ws) {
    // Создаем WebSocket соединение только один раз
    ws = new WebSocket(wsUrl);
    console.log('WebSocket connection attempt initiated...');  // Логируем начало создания соединения

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      logAllClientSubscriptions();
      const message = JSON.parse(event.data);
      console.log('Parsed message:', message);
      // Проверка на relevantData и фильтрация по ключам для каждого клиента
      if (message) {
        console.log(`Received message from WebSocket: ${JSON.stringify(message)}`);  // Логируем сообщение от WebSocket

        clients.forEach(client => {
          const key = client.subscriptions;
          console.log(`${key}`);
          client.subscriptions.forEach(subKey => {
            if (subKey && subKey in message) {
              console.log(`Sending data to client subscribed to ${subKey}`);
              console.log(`Sending data ${JSON.stringify(message[subKey])}`);
              client.postMessage({ key: subKey, data: message });  // Отправляем данные только тем, кто подписан на этот ключ
            }
          });
        });
      } else {
        console.log('No relevant data found in WebSocket message');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  console.log('try start port for client');  // Логируем начало работы порта для клиента
  port.start();
  console.log('Port started for client');  // Логируем начало работы порта для клиента
};

function logAllClientSubscriptions() {
  console.log("Current subscriptions for all clients:");
  clients.forEach((client, index) => {
    console.log(`Client ${index + 1} subscriptions: ${client.subscriptions ? client.subscriptions.join(', ') : 'No subscriptions'}`);
  });
}