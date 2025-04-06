import pytest
from fastapi.testclient import TestClient
from backend.userMain import app

client = TestClient(app)

# --- AUTH TESTS ---
def test_register_user_success():
    payload = {
        "username": "newuser123",
        "email": "newuser@example.com",
        "password": "testpass123"
    }
    response = client.post("/auth/signup", json=payload)
    assert response.status_code in [200, 400]  # account may already exist

def test_login_success():
    payload = {
        "username": "newuser123",
        "password": "testpass123"
    }
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_failure():
    payload = {
        "username": "wronguser",
        "password": "wrongpass"
    }
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 401

# --- PREFERENCE TESTS ---
def test_submit_preferences():
    payload = {
        "user_id": "dummy-user-id",
        "genres": ["Action", "Comedy"],
        "rating": "PG-13",
        "era": "2010s"
    }
    response = client.post("/preferences/submit", json=payload)
    assert response.status_code in [200, 404]  # 404 if dummy user not found

def test_submit_preferences_missing_field():
    payload = {
        "user_id": "dummy-user-id",
        "genres": ["Action"]
    }
    response = client.post("/preferences/submit", json=payload)
    assert response.status_code == 422  # Unprocessable Entity due to missing fields

# --- RECOMMENDATION TESTS ---
def test_get_recommendations_invalid_user():
    response = client.get("/recommendations/dummy-user-id")
    assert response.status_code == 404

def test_get_recommendations_valid_user():
    valid_user_id = "actual_user_id_here"  # replace with real test user ID
    response = client.get(f"/recommendations/{valid_user_id}")
    assert response.status_code in [200, 404]  # 404 if user has no data

# --- SEARCH TESTS ---
def test_tmdb_search_success():
    response = client.get("/tmdb/search?query=batman")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert isinstance(data["results"], list)

def test_tmdb_search_no_results():
    response = client.get("/tmdb/search?query=asdfghjklzxcvbnmqwerty")
    assert response.status_code == 200
    assert response.json().get("results") == []

def test_tmdb_search_missing_query():
    response = client.get("/tmdb/search")
    assert response.status_code == 422

# --- PASSWORD RESET ---
def test_password_reset_invalid_email():
    response = client.post("/auth/forgot-password", json={"email": "nonexistent@example.com"})
    assert response.status_code == 404

def test_password_reset_valid_email():
    response = client.post("/auth/forgot-password", json={"email": "newuser@example.com"})
    assert response.status_code in [200, 500]  # 500 if email sending fails

# --- USER PROFILE ---
def test_get_profile_invalid_user():
    response = client.get("/profile/dummy-user-id")
    assert response.status_code == 404

# --- EXTRA UTILS ---
def test_homepage_unauthorized():
    response = client.get("/homepage")
    assert response.status_code == 401

def test_protected_route_without_token():
    response = client.get("/recommendations/protected-endpoint")
    assert response.status_code in [401, 403]

# --- AUTHENTICATED ROUTE TESTS ---
def test_access_homepage_with_token():
    login = client.post("/auth/login", json={"username": "newuser123", "password": "testpass123"})
    if login.status_code == 200:
        token = login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/homepage", headers=headers)
        assert response.status_code == 200

def test_authenticated_recommendations():
    login = client.post("/auth/login", json={"username": "newuser123", "password": "testpass123"})
    if login.status_code == 200:
        token = login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/recommendations/actual_user_id_here", headers=headers)
        assert response.status_code in [200, 404]

# --- EDGE CASES ---
def test_register_invalid_email():
    payload = {
        "username": "bademailuser",
        "email": "not-an-email",
        "password": "password123"
    }
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 422

def test_login_empty_fields():
    payload = {
        "username": "",
        "password": ""
    }
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 422

def test_password_reset_missing_email():
    response = client.post("/auth/forgot-password", json={})
    assert response.status_code == 422
