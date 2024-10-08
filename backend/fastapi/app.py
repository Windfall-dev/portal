from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import boto3
from boto3.dynamodb.conditions import Key
import uuid
import time
from mangum import Mangum
from dotenv import load_dotenv
import os
from typing import List

load_dotenv()

app = FastAPI()

dynamodb = boto3.resource('dynamodb')

users_table = dynamodb.Table('windfall-dev-users')
games_table = dynamodb.Table('windfall-dev-games')
scores_table = dynamodb.Table('windfall-dev-scores')

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Function to generate a random username
def generate_random_username():
    return f"user_{uuid.uuid4().hex[:8]}"

# Request models
class LoginRequest(BaseModel):
    user_id: str
    token: str
    user_name: str

class GameStartRequest(BaseModel):
    session_id: str
    stage: str
    start_time: int

class Position(BaseModel):
    x: int
    y: int

    def to_decimal(self):
        return {
            'x': Decimal(str(self.x)),
            'y': Decimal(str(self.y))
        }

class TapData(BaseModel):
    time: int
    position: Position

    def to_dict(self):
        return {
            'time': self.time,
            'position': self.position.to_decimal()
        }
    class Config:
        arbitrary_types_allowed = True

class GameEndRequest(BaseModel):
    game_id: str
    session_id: str
    end_time: int
    score: int
    tap_data: List[TapData]
    judgment_data: List[str]
    token: str
    user_id: str

    class Config:
        arbitrary_types_allowed = True

class PointRequest(BaseModel):
    deposit: float

class PointRankRequest(BaseModel):
    point: int

# JWT token validation
def get_current_user(token: str = Depends(oauth2_scheme)):
    response = users_table.scan(
        FilterExpression=Key('token').eq(token)
    )
    if response['Count'] == 0:
        raise HTTPException(status_code=401, detail="Invalid token")
    return response['Items'][0]

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    # Search for user by user ID
    response = users_table.get_item(Key={'user_id': request.user_id})
    if 'Item' not in response:
        # If user doesn't exist, register a new one
        new_user = {
            'user_id': request.user_id,
            'token': request.token,
            'username': request.user_name if request.user_name else generate_random_username(),
            'password': uuid.uuid4().hex,
            'points': 0,
            'expires_at': int(time.time()) + 3600
        }
        users_table.put_item(Item=new_user)
        
        return {
            "ok": True,
            "user_id": new_user['user_id'],
            "points": new_user['points'],
            "username": new_user['username']
        }
    else:
        user = response['Item']

        # If user exists but token is different, update it
        if user['token'] != request.token:
            users_table.update_item(
                Key={'user_id': user['user_id']},
                UpdateExpression="SET #token = :token",
                ExpressionAttributeNames={
                    '#token': 'token'
                },
                ExpressionAttributeValues={':token': request.token}
            )
        
        return {
            "ok": True,
            "user_id": user['user_id'],
            "points": user['points'],
            "username": user['username']
        }

@app.post("/api/game/start")
async def start_game(request: GameStartRequest, current_user: dict = Depends(get_current_user)):
    games_table.put_item(Item={
        'user_id': current_user['user_id'],
        'session_id': request.session_id,
        'stage': request.stage,
        'start_time': request.start_time,
        'status': 'in_progress'
    })
    return {"ok": True}

@app.post("/api/game/end")
async def end_game(request: GameEndRequest, current_user: dict = Depends(get_current_user)):
    tap_data_dicts = [tap.dict() for tap in request.tap_data]
    response = users_table.get_item(Key={'user_id': current_user['user_id']})
    if 'Item' not in response:
        raise HTTPException(status_code=404, detail="User not found")
    user = response['Item']
    
    game = games_table.get_item(Key={'session_id': request.session_id})
    
    if 'Item' not in game:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    scores_table.put_item(Item={
        'session_id': request.session_id,
        'user_id': current_user['user_id'],
        'game_id': request.game_id,
        'tap_data': tap_data_dicts,
        'judgment_data': request.judgment_data,
        'score': request.score,
        'timestamp': request.end_time
    })
    
    new_points = update_points(user['user_id'], request.score)
    
    rankings = get_rankings()
    
    return {
        "ok": True,
        "game_result": {
            "score": request.score,
            "rankings": rankings,
            "new_point_balance": new_points
        }
    }

@app.get("/api/rankings")
async def get_rankings_api():
    rankings = get_rankings()
    return {"rankings": rankings}

@app.post("/api/point/add")
async def add_points(request: PointRequest,  current_user: dict = Depends(get_current_user)):
    # Multiply deposit by 10,000 and add to points
    points_to_add = int(request.deposit * 10000)

    response = users_table.get_item(Key ={'user_id': current_user['user_id']})
    if 'Item' not in response:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = response['Item']
    new_points = user.get('points', 0) + points_to_add
    users_table.update_item(
        Key={'user_id': current_user['user_id']},
        UpdateExpression="SET points = :points",
        ExpressionAttributeValues={':points': new_points}
    )

    return {
        "ok": True,
        "user_id": current_user['user_id'],
        "new_point_balance": new_points
    }

@app.post("/api/point/rank")
async def get_point_rank(request: PointRankRequest, current_user: dict = Depends(get_current_user)):
    # Search for user by user ID
    response = users_table.get_item(Key={'user_id': current_user['user_id']})
    
    user = response['Item']
    
    point = request.point + user['points']  # Retrieve point from request body
    rankings = get_rankings()  # Retrieve all user rankings
    target_rank = None
    
    for i, ranking in enumerate(rankings):
        # Compare each user's points with the argument's points
        if point > int(ranking["points"].replace(",", "")):  # Remove commas and convert to int
            target_rank = i + 1  # Ranking starts from 1, so add 1 to the index
            break
    
    if target_rank is None:
        target_rank = len(rankings) + 1  # If not found, assign the next position in ranking
    
    return {
        "ok": True,
        "targetRank": target_rank,
        "userPoint": point,
    }

def get_rankings():
    # Retrieve all users sorted by points
    response = users_table.scan()
    users = response.get('Items', [])
    
    # Sort by points in descending order and assign rankings
    users_sorted = sorted(users, key=lambda x: int(x.get('points', 0)), reverse=True)
    
    rankings = []
    for i, user in enumerate(users_sorted):
        user_id = user.get('user_id', 'unknown')
        points = user.get('points', 0)
        shortened_id = f"{user_id[:4]}..{user_id[-4:]}" if len(user_id) >= 8 else user_id
        
        rankings.append({
            "rank": str(i + 1),
            "avatar": "/pfp_sample.png",  # Fixed avatar value
            "name": shortened_id,  # Use user_id
            "points": format_points(points)  # Format points with commas
        })
    
    return rankings

def format_points(points):
    # Format points with commas
    try:
        return "{:,}".format(int(points))
    except (ValueError, TypeError):
        return "0"

def update_points(user_id, score):
    response = users_table.get_item(Key={'user_id': user_id})
    if 'Item' not in response:
        raise HTTPException(status_code=404, detail="User not found")
    user = response['Item']
    new_points = user.get('points', 0) + score
    users_table.update_item(
        Key={'user_id': user_id},
        UpdateExpression="SET points = :points",
        ExpressionAttributeValues={':points': new_points}
    )
    return new_points

# Lambda handler for AWS
handler = Mangum(app)