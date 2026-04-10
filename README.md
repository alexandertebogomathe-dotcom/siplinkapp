# Sip&Link - Find Your Coffee Buddy

A simple web app to meet strangers for coffee and have meaningful conversations.

## Features

- 🔥 **Host a Session** - Create a coffee meetup with location, time, and conversation starter
- 💬 **Real-time Chat** - Message with other participants instantly
- 💕 **Join Events** - Browse available sessions and join with one click
- 🔴 **Capacity Tracking** - See how many spots are left in each session
- 👥 **Guest List** - View who's joining your session
- 📱 **Mobile Friendly** - Works on desktop, tablet, and phone

## How to Run Locally

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SipLinkApp
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Streamlit app:
```bash
streamlit run streamlit_app.py
```

4. Open your browser to `http://localhost:8501`

## How to Deploy on Streamlit Cloud

1. **Create a GitHub repository:**
   - Go to [github.com](https://github.com) and log in
   - Click "New repository"
   - Name it "SipLinkApp"
   - Click "Create repository"

2. **Push your code to GitHub:**
   ```bash
   cd SipLinkApp
   git add .
   git commit -m "Initial commit - Sip&Link Streamlit app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/SipLinkApp.git
   git push -u origin main
   ```

3. **Deploy on Streamlit Cloud:**
   - Go to [share.streamlit.io](https://share.streamlit.io)
   - Click "New app"
   - Select your GitHub repository
   - Select branch: `main`
   - Select file path: `streamlit_app.py`
   - Click "Deploy"

4. **Access your app:**
   - Your app will be live at `https://YOUR_USERNAME-siplink.streamlit.app`

## Architecture

- **Frontend:** Streamlit (single Python file)
- **Backend:** Flask REST API (in `backend/app.py`)
- **Storage:** In-memory (no database required for MVP)

## Notes

- The app uses `localhost:5000` for the backend by default
- For production deployment, you may need to host the backend separately (e.g., Heroku, Railway)
- User data is stored in memory and will be lost when the server restarts

## License

MIT License
