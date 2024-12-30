// subscriptionService.js
class SubscriptionService {
  constructor() {
    this.worker = new SharedWorker("/sharedworker.js");
    this.subscriptions = {};
    
    // Логгирование при установке порта
    console.log("SharedWorker initialized and port is set.");
    
    this.worker.port.onmessage = (event) => {
      const { key, data } = event.data || {};
      
      // Логгирование получения сообщения и ключа
      // console.log(`Received message from worker:`, event.data);
      console.log(`Key from the message: ${key} Received message from worker:${event.data}`);
    
      if (key && this.subscriptions[key]) {
        console.log(`Dispatching data for key: ${key}`);
        this.subscriptions[key].forEach((callback) => callback(data[key]));
      }
    };
  }

  subscribe(key, callback) {
    // Логгирование при подписке
    if (!this.subscriptions[key]) {
      this.subscriptions[key] = [];
      console.log(`Subscribing to key: ${key}`);
      this.worker.port.postMessage({ action: "subscribe", key });
    } else {
      console.log(`Already subscribed to key: ${key}`);
    }

    this.subscriptions[key].push(callback);
  }

  unsubscribe(key, callback) {
    // Логгирование при отписке
    if (this.subscriptions[key]) {
      this.subscriptions[key] = this.subscriptions[key].filter((cb) => cb !== callback);
      
      // Если больше нет подписчиков, отправляем сообщение worker
      if (this.subscriptions[key].length === 0) {
        console.log(`Unsubscribing from key: ${key}`);
        delete this.subscriptions[key];
        this.worker.port.postMessage({ action: "unsubscribe", key });
      } else {
        console.log(`Still subscribed to key: ${key}`);
      }
    }
  }

  sendMessage(channel, message) {
    console.log(`Sending message to ${channel}`, message);
    this.subscriptions[channel]?.forEach((handler, index) => {
      console.log(`Sending to subscriber ${index}:`, handler);
      handler(message);  // Отправляем данные каждому подписчику
    });
  }
  

  close() {
    // Логгирование при закрытии порта
    console.log("Closing SharedWorker port.");
    this.worker.port.close();
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;
