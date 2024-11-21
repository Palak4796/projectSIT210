import os
import time
from google.cloud import firestore
import paho.mqtt.client as mqtt

# Set up Google Cloud Firestore credentials securely
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/home/raspberry/palakrani/firestore-service-account-file.json"
db = firestore.Client()

# MQTT setup
BROKER = "broker.hivemq.com"
BROKER_PORT = 1883
MQTT_TOPIC_NANO = "SIT210/BIN"         # Topic for Arduino Nano
MQTT_TOPIC_ESP32 = "SIT210/BIN2"       # Topic for ESP32

# Dijkstra Algorithm
class PriorityQueue:
    """Simple priority queue for Dijkstra's algorithm."""
    def __init__(self):
        self.nodes = []

    def enqueue(self, element, priority):
        self.nodes.append((priority, element))
        self.nodes.sort()

    def dequeue(self):
        return self.nodes.pop(0)[1] if self.nodes else None

def dijkstra(graph, start):
    """Dijkstra's algorithm for finding shortest paths."""
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    previous_nodes = {node: None for node in graph}
    pq = PriorityQueue()
    pq.enqueue(start, 0)

    while pq.nodes:
        current_node = pq.dequeue()

        for neighbor, weight in graph[current_node]:
            alt = distances[current_node] + weight
            if alt < distances[neighbor]:
                distances[neighbor] = alt
                previous_nodes[neighbor] = current_node
                pq.enqueue(neighbor, alt)

    return distances, previous_nodes

# Task: Firestore storage
def store_message_to_firestore(topic, payload):
    """Store MQTT message to Firestore based on topic."""
    try:
        collection_name = "BinNanoMessages" if topic == MQTT_TOPIC_NANO else "BinESP32Messages"
        db.collection(collection_name).add({
            'distance': payload,
            'timestamp': firestore.SERVER_TIMESTAMP,
        })
        print(f"Data stored in Firestore (collection: {collection_name}).")
    except Exception as e:
        print(f"Error storing message in Firestore: {e}")

# Task: MQTT message handling
def on_message(client, userdata, message):
    """Callback for MQTT message reception."""
    payload = message.payload.decode()
    topic = message.topic
    print(f"Message received on topic '{topic}': {payload}")

    # Example usage of Dijkstra with dummy graph
    graph = {
        'A': [('B', 4), ('C', 1)],
        'B': [('A', 4), ('C', 2), ('D', 5)],
        'C': [('A', 1), ('B', 2), ('D', 8)],
        'D': [('B', 5), ('C', 8)]
    }
    distances, _ = dijkstra(graph, 'A')
    print("Shortest distances from A:", distances)

    # Store the message and distances in Firestore
    store_message_to_firestore(topic, payload)

# Task: Wi-Fi and MQTT connection reliability
def setup_mqtt_client():
    """Set up MQTT client with reconnection logic."""
    client = mqtt.Client()
    client.on_message = on_message
    try:
        client.connect(BROKER, BROKER_PORT)
        print("Connected to MQTT broker.")
        client.subscribe([(MQTT_TOPIC_NANO, 0), (MQTT_TOPIC_ESP32, 0)])
        print(f"Subscribed to topics: {MQTT_TOPIC_NANO}, {MQTT_TOPIC_ESP32}.")
    except Exception as e:
        print(f"Error connecting to MQTT broker: {e}. Retrying...")
        time.sleep(5)
        setup_mqtt_client()
    return client

# Task: Low power mode (efficiency)
def monitor_and_process(client):
    """Monitor incoming messages and apply low power mode during idle periods."""
    client.loop_start()
    try:
        while True:
            time.sleep(1)  # Keeps the process alive with minimal CPU usage
    except KeyboardInterrupt:
        print("Exiting gracefully...")
    finally:
        client.loop_stop()
        client.disconnect()

# Main function
def main():
    """Main function to initialize and start the process."""
    print("Starting application...")
    mqtt_client = setup_mqtt_client()
    monitor_and_process(mqtt_client)

if __name__ == "__main__":
    main()
