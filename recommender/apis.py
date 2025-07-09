from fastapi import APIRouter, HTTPException, Request, status, Query, Depends
from utils import (query_and_translate, start_sentiment_analysis,
                   zero_shot_classification, retrieve_semantic_recommendations,
                   verify_administrator)
router = APIRouter()
from middlewareAuth import authenticate_token

@router.get("/translate")
async def translate(request: Request, user_data: dict  = Depends(authenticate_token)):
    try:
        if not verify_administrator(user_data.get("UserId")):
            raise HTTPException(status_code=403, detail="Forbidden: Only admins may call this")
        result = await query_and_translate(request.app)
        return {"status": "success", **result}
    except Exception as e:
        print(f"Translation job failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process translation job"
        )

@router.get("/begin-sentiment-analysis")
async def begin_sentiment_analysis(request: Request, user_data: dict  = Depends(authenticate_token)):
    try:
        if not verify_administrator(user_data.get("UserId")):
            raise HTTPException(status_code=403, detail="Forbidden: Only admins may call this")
        await start_sentiment_analysis(request.app)
    except Exception as e:
        print(f"Sentiment analysis job failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process translation job"
        )

@router.get("/initialize-vector-store")
async def create_vector_store(request:Request, user_data: dict  = Depends(authenticate_token)):
    try:
        if not verify_administrator(user_data.get("UserId")):
            raise HTTPException(status_code=403, detail="Forbidden: Only admins may call this")
        await zero_shot_classification(request.app)
    except Exception as e:
        print(f"Vector store creation exception: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize vector store"
        )


from pydantic import BaseModel, Field
class RecommendationRequest(BaseModel):
    query: str = Field(..., description="Search query for recommendations")
    top_k: int = Field(5, ge=1, le=50, description="Number of recommendations to return")
    sentiment: str


@router.post("/request-recommendations", status_code=status.HTTP_200_OK)
async def request_recommendations(
                request: Request,
                body: RecommendationRequest,
                user_data: dict = Depends(authenticate_token)):
    try:
        user_id = user_data.get("id")
        res = await retrieve_semantic_recommendations(
            request.app,
            body.query,
            body.top_k,
            user_id,
            body.sentiment
        )
        return res
    except Exception as e:
        print(f"Recommendations exception: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendations:{e}"
        )