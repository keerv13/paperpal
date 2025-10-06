# Research Paper QA Chatbot
A full-stack web application that allows users to upload research documents, ask questions about them, and receive AI-generated answers based on the document using Retrieval-Augmented Generation (RAG) pipeline.

# Features
* User Authentication - Signup/login with password reset functionality
* Document processing - - Upload document, extract texts, chunk and embed texts
* Vector Search - Efficient semantic search using sentence embeddings
* AI-Powered Q&A - Ask questions about your documents and get intelligent answers
* Document Management - View and delete uploaded documents

# Prerequisites
* Node.js (v14 or higher)
* Python 3.x
* MongoDB account (MongoDB Atlas or local instance)
* Mistral AI API key
* Gmail account (for password reset emails)

# Environment variables
Set up environment variables in the ```.env``` file in the backend directory
```
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
MAIL_USER=your_gmail_address
MAIL_PASS=your_gmail_app_password
MISTRAL_API_KEY=your_api_key
```

## Setting up Gmail for password reset:
1. Enable 2-factor authentication on the Gmail account
2. Generate an App Password
3. Use email address as ```MAIL_USER```
4. Use the generated password as ```MAIL_PASS```

## Getting a Mistral API Key:
1. Sign up at [Mistral AI](https://mistral.ai/)
2. Navigate to API Keys section
3. Generate a new API key
4. Use generated API key as ```MISTRAL_API_KEY```

## How to Run
1. Clone the repo
```
git clone https://github.com/keerv13/paperpal
```
2. Create and activate python virtual environemnt
```
python -m venv venv
venv\Scripts\activate
```
3. Install python dependencies
```
pip install -r requirements.txt
```
4. Run the frontend:
```
npm install
npm start
```
5. Start the authentication server:
```
cd backend
npm start
```
6. Start the backend for document processing
```
python backend\app.py
```

# Output
## Login/Signup Page
<img width="805" height="553" alt="Image" src="https://github.com/user-attachments/assets/90814755-e2fb-4808-b16d-db473d6ded90" />

## Password Reset
<img width="475" height="434" alt="Image" src="https://github.com/user-attachments/assets/d7fe785c-8e39-4335-848b-248fcfb7c5ef" />

## Dashboard Page
<img width="1919" height="981" alt="Image" src="https://github.com/user-attachments/assets/d847a304-58e2-4be1-8756-2f280b70660e" />
