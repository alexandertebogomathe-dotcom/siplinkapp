import streamlit as st
import json
import time
import requests
from datetime import datetime
from typing import Optional, List, Dict
from functools import lru_cache

# Page config
st.set_page_config(
    page_title="☕ Sip&Link - Meet someone for coffee",
    page_icon="☕",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Backend API URL
API_URL = "http://localhost:5000"

# Initialize session state
if 'current_user' not in st.session_state:
    st.session_state.current_user = None

if 'cache_time' not in st.session_state:
    st.session_state.cache_time = 0

def normalize_name(name: str) -> str:
    """Normalize user names: trim and lowercase"""
    return name.strip().lower() if name else ""

def fetch_invites():
    """Fetch all available invites from backend (cached for 3 seconds)"""
    try:
        response = requests.get(f"{API_URL}/invites", timeout=3)
        if response.status_code == 200:
            return response.json()
    except:
        st.error("Could not connect to backend")
    return []

def fetch_all_events():
    """Fetch all events (including full ones) from backend"""
    try:
        response = requests.get(f"{API_URL}/all-events", timeout=2)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return []

def create_invite(host: str, time: str, location: str, detail: str, spots: int, 
                  beverages: List[str], fun_fact: str) -> bool:
    """Create a new coffee event via backend"""
    try:
        payload = {
            'host': host,
            'time': time,
            'location': location,
            'detail': detail,
            'spots': spots,
            'beverages': beverages,
            'fun_fact': fun_fact
        }
        response = requests.post(f"{API_URL}/invites", json=payload, timeout=2)
        if response.status_code == 201:
            st.session_state['invites_cache_time'] = 0
            return True
    except:
        st.error("Error creating event")
    return False

def join_event(invite_id: int, guest_name: str) -> bool:
    """Guest joins an event via backend"""
    try:
        payload = {
            'id': invite_id,
            'guestName': guest_name
        }
        response = requests.post(f"{API_URL}/join", json=payload, timeout=2)
        if response.status_code == 200:
            st.session_state['invites_cache_time'] = 0
            return True
    except:
        st.error("Error joining event")
    return False

def send_message(invite_id: int, sender: str, text: str) -> bool:
    """Send a message via backend"""
    try:
        payload = {
            'sender': sender,
            'text': text
        }
        response = requests.post(f"{API_URL}/messages/{invite_id}", json=payload, timeout=2)
        if response.status_code == 200:
            st.session_state['messages_cache_time'] = 0
            return True
    except:
        st.error("Error sending message")
    return False

def fetch_messages(invite_id: int) -> List:
    """Fetch messages for an event"""
    try:
        response = requests.get(f"{API_URL}/messages/{invite_id}", timeout=2)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return []

def delete_event(invite_id: int, host: str) -> bool:
    """Delete an event (host only) via backend"""
    try:
        payload = {'host': host}
        response = requests.delete(f"{API_URL}/invites/{invite_id}", json=payload, timeout=2)
        if response.status_code == 200:
            st.session_state['invites_cache_time'] = 0
            return True
    except:
        st.error("Error deleting event")
    return False

# Main UI
st.markdown("""
<style>
    .main-header {
        text-align: center;
        color: #6F4E37;
        margin-bottom: 30px;
    }
    .event-card {
        padding: 20px;
        border-radius: 10px;
        border-left: 4px solid #C47B3A;
        background-color: #F9F7F4;
        margin-bottom: 15px;
    }
    .host-badge {
        background-color: #C47B3A;
        color: white;
        padding: 5px 12px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: bold;
    }
    .full-badge {
        background-color: #E74C3C;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 11px;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
<div class="main-header">
    <h1>☕ Sip&Link</h1>
    <p style="color: #A89880; font-style: italic;">Meet someone new over coffee</p>
</div>
""", unsafe_allow_html=True)

# Sidebar for user session
with st.sidebar:
    st.header("👤 Your Profile")
    
    if st.session_state.current_user:
        st.success(f"Logged in as: **{st.session_state.current_user}**")
        if st.button("🚪 Logout"):
            st.session_state.current_user = None
            st.rerun()
    else:
        user_name = st.text_input("Enter your name:", placeholder="What's your name?", key="user_input")
        if user_name and st.button("✅ Enter"):
            st.session_state.current_user = normalize_name(user_name)
            st.rerun()

# Main content
if not st.session_state.current_user:
    st.warning("👋 Please enter your name in the sidebar to get started!")
else:
    # Tab interface
    tab1, tab2, tab3 = st.tabs(["🔥 Live Sessions", "💕 My Events", "💬 Messages"])
    
    # ===== TAB 1: LIVE SESSIONS =====
    with tab1:
        st.header("🔥 Live Sessions")
        
        col1, col2 = st.columns([3, 1])
        
        with col2:
            if st.button("☕ Host a Session", use_container_width=True):
                st.session_state.show_host_form = True
        
        # Host form modal
        if st.session_state.get('show_host_form', False):
            with st.expander("📝 Create Your Session", expanded=True):
                with st.form("host_form"):
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        time_choice = st.selectbox("When?", ["Now", "+15 min", "+30 min", "+1 hour"])
                        location = st.selectbox("Location", [
                            "Common room", 
                            "Kitchen — floor 1", 
                            "Kitchen — floor 2",
                            "Kitchen — floor 3",
                            "Kitchen — floor 4",
                            "Kitchen — floor 5",
                            "Kitchen — floor 6",
                            "Kitchen — floor 7",
                            "Courtyard",
                            "My room"
                        ])
                        spots = st.selectbox("# of Spots", [1, 2, 3, 4], index=0)
                    
                    with col2:
                        detail = st.text_input("Room/Kitchen Number (optional)", placeholder="e.g. 312, Floor 2")
                        beverages = st.multiselect("Beverages Available", [
                            "☕ Coffee",
                            "🍵 Tea",
                            "🥛 Milk",
                            "🧃 Juice",
                            "💧 Water",
                            "🧋 Boba Tea"
                        ])
                    
                    fun_fact = st.text_area("Your conversation starter", placeholder="Ask me about...", max_chars=100)
                    
                    if st.form_submit_button("✨ Create Invite", use_container_width=True):
                        if not fun_fact.strip():
                            st.error("Please add a conversation starter!")
                        elif not beverages:
                            st.error("Please select at least one beverage!")
                        else:
                            create_invite(
                                host=st.session_state.current_user,
                                time=time_choice,
                                location=location,
                                detail=detail,
                                spots=spots,
                                beverages=beverages,
                                fun_fact=fun_fact
                            )
                            st.session_state.show_host_form = False
                            st.success("✅ Event created! Check My Events tab")
                            st.rerun()
        
        # Display available events
        available = fetch_invites()
        available = [i for i in available if i.get('host', '').lower() != (st.session_state.current_user or '')]
        
        if not available:
            st.info("☕ No sessions available. Be the first to host!")
        else:
            st.markdown(f"### {len(available)} Session(s) Available")
            
            for invite in available:
                st.markdown(f"""
                <div class="event-card">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h4 style="margin: 0;">{invite.get('host', 'Unknown').title()}</h4>
                            <p style="color: #A89880; margin: 5px 0;">🍵 {', '.join(invite.get('beverages', []))}</p>
                        </div>
                        <span class="host-badge">HOST</span>
                    </div>
                    <hr style="margin: 10px 0;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <p style="margin: 0;"><strong>📍</strong> {invite.get('location', '')}{' - ' + invite.get('detail', '') if invite.get('detail') else ''}</p>
                        <p style="margin: 0;"><strong>⏰</strong> {invite.get('time', '')}</p>
                    </div>
                    <p style="margin: 5px 0; font-style: italic; color: #8B5A3B;">"{invite.get('fun_fact', '')}"</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                        <span>👥 {invite.get('spots', 0)} spot{'s' if invite.get('spots', 0) != 1 else ''} available
                        {'<span class="full-badge">FULL</span>' if invite.get('spots', 0) == 0 else ''}</span>
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                col1, col2 = st.columns([3, 1])
                with col2:
                    if st.button("Join ☕", key=f"join_{invite['id']}", use_container_width=True):
                        if join_event(invite['id'], st.session_state.current_user):
                            st.success(f"✅ Joined {invite.get('host', 'host').title()}'s session!")
                            st.rerun()
                        else:
                            st.error("❌ Could not join session")
    
    # ===== TAB 2: MY EVENTS =====
    with tab2:
        st.header("💕 My Events")
        
        user_normalized = normalize_name(st.session_state.current_user)
        all_events = fetch_all_events()
        
        my_hosted = [i for i in all_events if normalize_name(i.get('host', '')) == user_normalized]
        my_joined = [i for i in all_events if user_normalized in [normalize_name(g) for g in i.get('guests', [])]]
        
        if not my_hosted and not my_joined:
            st.info("No events yet. Host one or join a live session!")
        else:
            if my_hosted:
                st.subheader("👑 Hosting")
                for invite in my_hosted:
                    with st.container(border=True):
                        col1, col2, col3 = st.columns([2, 1, 1])
                        
                        with col1:
                            st.markdown(f"**📍 {invite.get('location', '')}** {invite.get('detail', '')}")
                            st.markdown(f"⏰ {invite.get('time', '')}")
                            st.markdown(f"🍵 {', '.join(invite.get('beverages', []))}")
                        
                        with col2:
                            original = invite.get('original_spots', 1)
                            current = invite.get('spots', 0)
                            joined = original - current
                            capacity_pct = (joined / original) * 100 if original > 0 else 0
                            st.metric("Capacity", f"{joined}/{original}")
                            st.progress(capacity_pct / 100)
                        
                        with col3:
                            guests = invite.get('guests', [])
                            if guests:
                                st.markdown("**Guests:**")
                                for guest in guests:
                                    st.markdown(f"• {guest.title()}")
                            else:
                                st.info("Waiting for guests...")
                        
                        c1, c2, c3 = st.columns(3)
                        with c1:
                            if st.button("💬 Chat", key=f"chat_{invite['id']}", use_container_width=True):
                                st.session_state.selected_event_id = invite['id']
                                st.session_state.show_chat = True
                        
                        with c2:
                            st.write("")
                        
                        with c3:
                            if st.button("🗑️ End", key=f"delete_{invite['id']}", use_container_width=True, type="secondary"):
                                if delete_event(invite['id'], st.session_state.current_user):
                                    st.success("✅ Event ended!")
                                    st.rerun()
            
            if my_joined:
                st.subheader("🎯 Joined")
                for invite in my_joined:
                    with st.container(border=True):
                        col1, col2 = st.columns([3, 1])
                        
                        with col1:
                            st.markdown(f"**☕ With {invite.get('host', '').title()}**")
                            st.markdown(f"📍 {invite.get('location', '')} {invite.get('detail', '')}")
                            st.markdown(f"⏰ {invite.get('time', '')}")
                        
                        with col2:
                            if st.button("💬 Chat", key=f"chat_joined_{invite['id']}", use_container_width=True):
                                st.session_state.selected_event_id = invite['id']
                                st.session_state.show_chat = True
    
    # ===== TAB 3: MESSAGES =====
    with tab3:
        st.header("💬 Messages")
        
        user_normalized = normalize_name(st.session_state.current_user)
        all_events = fetch_all_events()
        
        user_events = [i for i in all_events 
                       if normalize_name(i.get('host', '')) == user_normalized or 
                          user_normalized in [normalize_name(g) for g in i.get('guests', [])]]
        
        if not user_events:
            st.info("No conversations yet!")
        else:
            st.markdown(f"### {len(user_events)} Conversation(s)")
            
            for invite in user_events:
                messages = fetch_messages(invite['id'])
                msg_count = len(messages)
                
                with st.container(border=True):
                    col1, col2, col3 = st.columns([2, 1, 1])
                    
                    with col1:
                        st.markdown(f"📍 **{invite.get('location', '')}** {invite.get('detail', '')}")
                        st.markdown(f"⏰ {invite.get('time', '')}")
                    
                    with col2:
                        if invite.get('spots', 0) == 0:
                            st.markdown("🔴 **Full**")
                        else:
                            st.markdown(f"👥 {invite.get('spots', 0)} spots")
                    
                    with col3:
                        st.markdown(f"💬 **{msg_count}** messages")
                    
                    if st.button("Open Chat", key=f"open_chat_{invite['id']}", use_container_width=True):
                        st.session_state.selected_event_id = invite['id']
                        st.session_state.show_chat = True
    
    # ===== CHAT MODAL =====
    if st.session_state.get('show_chat'):
        event_id = st.session_state.get('selected_event_id')
        
        # Find the event
        all_events = fetch_all_events()
        event = next((i for i in all_events if i['id'] == event_id), None)
        
        if event:
            st.divider()
            st.subheader(f"💬 Chat - {event.get('location', '')}")
            
            # Display messages
            messages = fetch_messages(event_id)
            
            if messages:
                for msg in messages:
                    with st.chat_message(msg.get('sender', 'Unknown').title()):
                        st.write(msg.get('text', ''))
            else:
                st.info("No messages yet. Start the conversation!")
            
            # Message input
            col1, col2 = st.columns([4, 1])
            
            with col1:
                new_message = st.text_input("Your message:", placeholder="Type something...", key=f"msg_{event_id}")
            
            with col2:
                if st.button("Send", use_container_width=True):
                    if new_message.strip():
                        if send_message(event_id, st.session_state.current_user, new_message):
                            st.rerun()
                        else:
                            st.warning("Could not send message")
                    else:
                        st.warning("Message cannot be empty")
            
            if st.button("Close Chat"):
                st.session_state.show_chat = False
                st.rerun()
