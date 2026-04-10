from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json
import time
import threading
import queue

app = Flask(__name__)
CORS(app)

invites = []
messages = {}        # { invite_id: [ {sender, text, ts} ] }
notifications = {}   # { username: [ {type, data, ts, read} ] }
sse_clients = {}     # { username: Queue }
lock = threading.Lock()

# ── NAME NORMALIZATION (CRITICAL) ──

def normalize_name(name):
    """Normalize user names: trim and lowercase"""
    if not isinstance(name, str):
        name = str(name)
    return name.strip().lower()


# ── SSE HELPERS ──

def push_event(username, event_type, data):
    """Push a real-time event to a connected user"""
    username = normalize_name(username)
    with lock:
        if username in sse_clients:
            payload = json.dumps({"type": event_type, "data": data})
            sse_clients[username].put(payload)
        if username not in notifications:
            notifications[username] = []
        notifications[username].append({
            "type": event_type,
            "data": data,
            "ts": time.time(),
            "read": False
        })


@app.route('/events')
def sse_stream():
    """Server-Sent Events endpoint for real-time notifications"""
    username = normalize_name(request.args.get('user', ''))
    if not username:
        return Response("Missing user", status=400)

    q = queue.Queue()
    with lock:
        sse_clients[username] = q

    def stream():
        try:
            yield "data: {\"type\":\"connected\"}\n\n"
            while True:
                try:
                    msg = q.get(timeout=25)
                    yield f"data: {msg}\n\n"
                except queue.Empty:
                    yield ": ping\n\n"
        except GeneratorExit:
            with lock:
                sse_clients.pop(username, None)

    return Response(stream(), mimetype='text/event-stream',
                    headers={
                        'Cache-Control': 'no-cache',
                        'X-Accel-Buffering': 'no',
                        'Connection': 'keep-alive',
                    })


# ── INVITES ──

@app.route('/invites', methods=['GET'])
def get_invites():
    """Get all available invites (those with spots > 0) with messages"""
    available = []
    for inv in invites:
        if inv.get('spots', 0) > 0:
            # Include messages for each invite
            inv_copy = inv.copy()
            inv_copy['messages'] = messages.get(inv['id'], [])
            available.append(inv_copy)
    return jsonify(available)


@app.route('/all-events', methods=['GET'])
def get_all_events():
    """Get all invites including full ones (for My Events & Messages tabs)"""
    all_events = []
    for inv in invites:
        inv_copy = inv.copy()
        inv_copy['messages'] = messages.get(inv['id'], [])
        all_events.append(inv_copy)
    return jsonify(all_events)


@app.route('/invites', methods=['POST'])
def create_invite():
    """Create a new coffee event"""
    try:
        data = request.json or {}
        invite_id = len(invites) + 1
        
        # NORMALIZE HOST NAME
        host = normalize_name(data.get('host', ''))
        if not host:
            return jsonify({'error': 'host name required'}), 400
        
        invite = {
            'id': invite_id,
            'time': str(data.get('time', 'Now')).strip(),
            'location': str(data.get('location', '')).strip(),
            'detail': str(data.get('detail', '')).strip(),
            'spots': int(data.get('spots', 1)),
            'original_spots': int(data.get('spots', 1)),
            'host': host,  # NORMALIZED
            'phone': str(data.get('phone', '')).strip(),
            'fun_fact': str(data.get('fun_fact', '')).strip(),
            'additional_info': str(data.get('additional_info', '')).strip(),
            'beverages': data.get('beverages', []) if isinstance(data.get('beverages'), list) else [],
            'guests': [],        # FIXED: Initialize guests array
            'messages': [],      # FIXED: Initialize messages array
            'created_at': time.time()
        }
        
        invites.append(invite)
        messages[invite_id] = []
        
        print(f"✅ Created invite {invite_id} hosted by {invite['host']}")
        return jsonify(invite), 201
    except Exception as e:
        print(f"❌ Error creating invite: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/invites/<int:invite_id>', methods=['GET'])
def get_invite_detail(invite_id):
    """Get full invite details including guest list and messages"""
    for invite in invites:
        if invite['id'] == invite_id:
            invite_copy = invite.copy()
            invite_copy['messages'] = messages.get(invite_id, [])
            return jsonify(invite_copy), 200
    return jsonify({'error': 'Invite not found'}), 404


@app.route('/invites/<int:invite_id>', methods=['DELETE'])
def delete_invite(invite_id):
    """Delete an invite (host only)"""
    global invites
    try:
        data = request.json or {}
        # NORMALIZE REQUESTER NAME
        requester = normalize_name(data.get('host', ''))
        
        if not requester:
            return jsonify({'error': 'host name required'}), 400
        
        # Find the invite
        invite_to_delete = None
        for inv in invites:
            if inv['id'] == invite_id:
                invite_to_delete = inv
                break
        
        if not invite_to_delete:
            return jsonify({'error': 'Invite not found'}), 404
        
        # AUTHORIZATION: Only host can delete
        if invite_to_delete['host'] != requester:
            return jsonify({'error': 'Only the host can delete this event'}), 403
        
        # Delete the invite and its messages
        invites = [i for i in invites if i['id'] != invite_id]
        messages.pop(invite_id, None)
        
        # Notify all participants about deletion
        all_guests = invite_to_delete.get('guests', []) + invite_to_delete.get('joined_by', [])
        for guest in set(all_guests):  # set to deduplicate
            push_event(guest, 'event_deleted', {
                'invite_id': invite_id,
                'location': invite_to_delete['location'],
                'host': requester,
                'message': f"✅ {requester} has ended the session at {invite_to_delete['location']}"
            })
        
        print(f"🗑️  Host {requester} deleted event {invite_id} ({invite_to_delete['location']})")
        return jsonify({'message': 'Event deleted successfully'}), 200
    except Exception as e:
        print(f"❌ Error deleting invite: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ── JOIN ──

@app.route('/join', methods=['POST'])
def join_invite():
    """Guest joins an event"""
    try:
        data = request.json
        invite_id = data.get('id')
        # NORMALIZE GUEST NAME
        guest_name = normalize_name(data.get('guestName', ''))

        if not invite_id or not guest_name:
            return jsonify({'error': 'Missing invite id or guest name'}), 400

        for invite in invites:
            if invite['id'] == invite_id:
                # FIXED: Support both guests and joined_by arrays
                guests = invite.get('guests', [])
                joined_by = invite.get('joined_by', [])
                all_guests = guests + joined_by
                
                # Prevent duplicate joins
                if guest_name in all_guests:
                    return jsonify({'error': 'You already joined this event'}), 400
                
                if invite['spots'] > 0:
                    invite['spots'] -= 1
                    # Add to guests array (primary)
                    if 'guests' not in invite:
                        invite['guests'] = []
                    invite['guests'].append(guest_name)
                    # Keep joined_by for backward compatibility
                    if 'joined_by' not in invite:
                        invite['joined_by'] = []
                    invite['joined_by'].append(guest_name)

                    # Notify host (with normalized name)
                    push_event(invite['host'], 'guest_joined', {
                        'invite_id': invite_id,
                        'guest_name': guest_name,
                        'location': invite['location'],
                        'time': invite['time'],
                        'message': f"{guest_name} just joined your session!"
                    })

                    # Check if session just reached maximum capacity
                    session_full = invite['spots'] == 0
                    if session_full:
                        print(f"🔴 Session {invite_id} at {invite['location']} is NOW FULL! ({invite.get('original_spots', 1)} / {invite.get('original_spots', 1)})")
                        
                        # Notify host that session is now full
                        push_event(invite['host'], 'session_full', {
                            'invite_id': invite_id,
                            'location': invite['location'],
                            'time': invite['time'],
                            'message': '🔴 Your session is now full! It has been removed from live sessions.'
                        })
                        
                        # Notify all guests that session is full
                        for guest in invite.get('guests', []):
                            push_event(guest, 'session_full', {
                                'invite_id': invite_id,
                                'location': invite['location'],
                                'time': invite['time'],
                                'message': '🔴 This session is now full!'
                            })

                    print(f"✅ {guest_name} joined invite {invite_id} ({invite['spots']} spots left)")
                    # Include messages when returning
                    response_invite = invite.copy()
                    response_invite['messages'] = messages.get(invite_id, [])
                    response_invite['session_just_filled'] = session_full
                    return jsonify({'message': 'Joined', 'invite': response_invite, 'session_full': session_full}), 200
                else:
                    return jsonify({'error': 'No spots left'}), 400

        return jsonify({'error': 'Invite not found'}), 404
    except Exception as e:
        print(f"❌ Error joining invite: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ── CHAT ──

@app.route('/messages/<int:invite_id>', methods=['GET'])
def get_messages(invite_id):
    """Get all messages for an invite"""
    return jsonify(messages.get(invite_id, [])), 200


@app.route('/messages/<int:invite_id>', methods=['POST'])
def send_message(invite_id):
    """Send a message in an event chat"""
    try:
        data = request.json
        # NORMALIZE SENDER NAME
        sender = normalize_name(data.get('sender', ''))
        text = data.get('text', '').strip()
        
        if not sender or not text:
            return jsonify({'error': 'sender and text required'}), 400

        msg = {'sender': sender, 'text': text, 'ts': time.time()}

        if invite_id not in messages:
            messages[invite_id] = []
        messages[invite_id].append(msg)

        # Also update the invite's messages array
        invite = next((i for i in invites if i['id'] == invite_id), None)
        if invite:
            if 'messages' not in invite:
                invite['messages'] = []
            invite['messages'].append(msg)
            
            # Support both guests and joined_by
            participants = [invite['host']] + invite.get('guests', []) + invite.get('joined_by', [])
            # Remove duplicates
            participants = list(set(participants))
            for p in participants:
                if p != sender:
                    push_event(p, 'new_message', {
                        'invite_id': invite_id,
                        'sender': sender,
                        'text': text,
                        'location': invite['location']
                    })

        print(f"💬 Message from {sender} in invite {invite_id}")
        return jsonify(msg), 200
    except Exception as e:
        print(f"❌ Error sending message: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/message', methods=['POST'])
def send_message_legacy():
    """Legacy message endpoint for backward compatibility"""
    try:
        data = request.json
        invite_id = data.get('invite_id')
        # NORMALIZE SENDER NAME
        sender = normalize_name(data.get('sender', ''))
        text = data.get('text', '').strip()
        
        if not invite_id or not sender or not text:
            return jsonify({'error': 'sender, text, and invite_id required'}), 400

        msg = {'sender': sender, 'text': text, 'ts': time.time()}

        if invite_id not in messages:
            messages[invite_id] = []
        messages[invite_id].append(msg)

        # Also update the invite's messages array
        invite = next((i for i in invites if i['id'] == invite_id), None)
        if invite:
            if 'messages' not in invite:
                invite['messages'] = []
            invite['messages'].append(msg)
            
            # Support both guests and joined_by
            participants = [invite['host']] + invite.get('guests', []) + invite.get('joined_by', [])
            # Remove duplicates
            participants = list(set(participants))
            for p in participants:
                if p != sender:
                    push_event(p, 'new_message', {
                        'invite_id': invite_id,
                        'sender': sender,
                        'text': text,
                        'location': invite['location']
                    })

        print(f"💬 Message from {sender} in invite {invite_id} (legacy)")
        return jsonify(msg), 200
    except Exception as e:
        print(f"❌ Error sending message (legacy): {str(e)}")
        return jsonify({'error': str(e)}), 500


# ── NOTIFICATIONS ──

@app.route('/notifications', methods=['GET'])
def get_notifications():
    """Get all notifications for a user"""
    username = normalize_name(request.args.get('user', ''))
    if not username:
        return jsonify({'error': 'Missing user'}), 400
    return jsonify(notifications.get(username, [])), 200


@app.route('/notifications/read', methods=['POST'])
def mark_read():
    """Mark all notifications as read"""
    try:
        username = normalize_name(request.json.get('user', ''))
        if not username:
            return jsonify({'error': 'Missing user'}), 400
        
        if username in notifications:
            for n in notifications[username]:
                n['read'] = True
        return jsonify({'ok': True}), 200
    except Exception as e:
        print(f"❌ Error marking notifications: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ── ROOT ENDPOINT ──

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API info"""
    return jsonify({
        'app': 'Sip&Link Backend',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'invites': 'GET/POST /invites',
            'all_events': 'GET /all-events',
            'invite_detail': 'GET /invites/<id>',
            'delete_event': 'DELETE /invites/<id>',
            'join': 'POST /join',
            'messages': 'GET/POST /messages/<id>',
            'sse': 'GET /events?user=<name>',
            'health': 'GET /health'
        }
    }), 200


# ── HEALTH CHECK ──

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'invites': len(invites),
        'sse_clients': len(sse_clients)
    }), 200


if __name__ == '__main__':
    print("🚀 Sip&Link Backend starting on http://0.0.0.0:5000")
    app.run(debug=True, threaded=True, host='0.0.0.0', port=5000)
