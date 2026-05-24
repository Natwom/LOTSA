from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def send_personal_message(self, message: dict, user_id: int):
        ws = self.active_connections.get(user_id)
        if ws:
            await ws.send_json(message)

    async def broadcast(self, message: dict, user_ids: List[int]):
        for uid in user_ids:
            ws = self.active_connections.get(uid)
            if ws:
                await ws.send_json(message)

manager = ConnectionManager()