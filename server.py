import os
from flask import Flask, request, jsonify, redirect, make_response, send_file
from datetime import timedelta, datetime
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, current_user
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit
import mariadb

from ObjectDetectionFromImage import Detector
import bcrypt as bc
import mimetypes
import dotenv
import random
import string
from PIL import Image
import io
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=['*'])
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")
dotenv.load_dotenv()
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_ACCESS_COOKIE_NAME'] = 'access_token'
app.config['JWT_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['JWT_COOKIE_CSRF_PROTECT'] = False
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=2)
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY')
module = "faster-rcnn-inception-resnet-v2-tensorflow1-faster-rcnn-openimages-v4-inception-resnet-v2-v1"

def progress_callback(stage, data=None):
    socketio.emit('progress', {'stage': stage, 'data': data})

def generate_user_id():
    def random_string(length):
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

    return f"{random_string(4)}-{random_string(4)}-{random_string(4)}"

def validate_data(data, fields_to_validate):
    error_messages = {
        "password": "Password too short",
        "email": "Invalid email",
        "username": "Invalid username",
    }
    email = data.get('email', '')
    at_index = email.find("@")
    dot_index = email.rfind(".")

    validations = [
        ('password' in fields_to_validate and len(data.get('password', '')) < 8, error_messages['password']),
        ('email' in fields_to_validate and (email.count("@") != 1 or email.count(".") != 1 or not email[:at_index].isalnum() or not email[at_index+1:dot_index].isalnum()), error_messages['email']),
        ('username' in fields_to_validate and not data.get('username', '').isalnum(), error_messages['username']),
    ]

    for condition, error_message in validations:
        if condition:
            print(f"Validation failed for {error_message}")
            response = jsonify({"message": error_message})
            response.status_code = 400
            return response

    return None

def db_conn():
    try:
        conn = mariadb.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            port=int(os.getenv('DB_PORT')),
            db=os.getenv('DB_NAME'),
            password=os.getenv('DB_PASSWORD')
        )
        return conn
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB Platform: {e}")
        raise
@app.route('/', methods=['GET'])
def index():
    return redirect("http://localhost:5173")

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    conn = None
    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("SELECT password_hash FROM identity WHERE username = %s", (username,))
            row = cursor.fetchone()
            if row:
                password_match = bc.checkpw(password.encode('utf-8'), row[0].encode('utf-8'))
                if password_match:
                    cursor.execute("UPDATE identity SET last_login = %s WHERE username = %s", (datetime.now(), username))
                    conn.commit()
                    access_token = create_access_token(identity=username)
                    response = make_response(jsonify({"message": "Login successful"}))
                    response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='Strict')
                    print(f"Access token created: {access_token}")
                    print(f"Cookie set in response: {response.headers.get('Set-Cookie')}")

                    return response, 200
                else:
                    return jsonify({"message": "Invalid credentials"}), 401
            else:
                return jsonify({"message": "Invalid credentials"}), 401
    except mariadb.Error as e:
        return jsonify({"message": "Internal server error"}), 500
    finally:
        if conn is not None:
            conn.close()
@app.route('/api/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"message": "Logout successful"}))
    response.delete_cookie('access_token')
    return response, 200

@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@app.route('/api/detect', methods=['POST'])
@jwt_required()
def detect():
    if 'file' in request.files:
        file = request.files['file']
        uuid = request.form.get('uuid')

        if not uuid:
            return jsonify({"message": "UUID is required"}), 400

        mimetype = mimetypes.guess_type(file.filename)[0]
        if not mimetype or not mimetype.startswith('image'):
            return jsonify({"message": "Invalid file type"}), 400

        conn = None
        try:
            conn = db_conn()
            with conn.cursor() as cursor:
                cursor.execute("SELECT email, id, max_boxes FROM identity WHERE username = %s", (get_jwt_identity(),))
                email, user_id, max_boxes = cursor.fetchone()

                ai = Detector(module, progress_callback)
                file_path = os.path.join(f'Images/{email}/Before_Recognition', file.filename)
                if not (os.path.exists(f'Images/{email}/Before_Recognition')):
                    os.makedirs(f'Images/{email}/Before_Recognition')

                file.save(file_path)
                progress_callback(2)
                data = ai.run_with_local(file_path, email=email, max_boxes=max_boxes)
                print(data)
                avg_score = int(sum(data['scores']) / len(data['scores']) * 100)
                objects_detected = len(data['names'])
                cursor.execute("INSERT INTO UnprocessedImages(id_uimage, path, user_id) VALUES (%s, %s, %s)",
                               (uuid, f"Images/{email}/Before_Recognition/{data['filename']}", user_id))
                cursor.execute("INSERT INTO ProcessedImages(id_pimage, path, user_id, id_uimage, avg_score, objects_identified) VALUES (%s, %s, %s, %s, %s, %s)",
                               (uuid, f"Images/{email}/After_Recognition/RECOGNIZED_{data['filename']}", user_id, uuid, avg_score, objects_detected))

                conn.commit()


                data["filename"] = f"Images/{email}/After_Recognition/RECOGNIZED_{data['filename']}"
                return jsonify(data), 200

        except mariadb.Error as e:
            print(f"DB ERROR: {str(e)}")
            return jsonify({"message": "Detection failed", "error": str(e)}), 500
        except Exception as e:
            print(f"Error processing image: {e}")
            return jsonify({"message": "Detection failed", "error": str(e)}), 500
        finally:
            if conn is not None:
                conn.close()

    elif request.is_json:
        data = request.get_json()
        uuid = data.get('uuid')
        url = data.get('url')

        if not uuid:
            return jsonify({"message": "UUID is required"}), 400

        if not url:
            return jsonify({"message": "No URL provided"}), 400

        if not url.startswith('http'):
            return jsonify({"message": "Invalid URL"}), 400

        conn = None
        try:
            conn = db_conn()
            with conn.cursor() as cursor:
                cursor.execute("SELECT email, id, max_boxes FROM identity WHERE username = %s", (get_jwt_identity(),))
                email, user_id, max_boxes = cursor.fetchone()

                ai = Detector(module, progress_callback)
                dataReceived = ai.run_with_online(url, email=email, max_boxes=max_boxes)


                avg_score = int(sum(dataReceived['scores']) / len(dataReceived['scores']) * 100)

                objects_detected = len(dataReceived['names'])
                cursor.execute("INSERT INTO UnprocessedImages(id_uimage, path, user_id) VALUES (%s, %s, %s)",
                               (uuid, f"Images/{email}/Before_Recognition/{dataReceived['filename']}", user_id))
                cursor.execute(
                    "INSERT INTO ProcessedImages(id_pimage, path, user_id, id_uimage, avg_score, objects_identified) VALUES (%s, %s, %s, %s, %s, %s)",
                    (uuid, f"Images/{email}/After_Recognition/RECOGNIZED_{dataReceived['filename']}", user_id, uuid,
                     avg_score, objects_detected))

                conn.commit()
                dataReceived["filename"] = f"Images/{email}/After_Recognition/RECOGNIZED_{dataReceived['filename']}"
                return jsonify(dataReceived), 200
        except Exception as e:
            print(f"Error processing URL: {e}")
            return jsonify({"message": "Detection failed", "error": str(e)}), 500
        finally:
            if conn is not None:
                conn.close()

    else:
        return jsonify({"message": "Unsupported media type"}), 415

@app.route('/api/get_images', methods=['GET'])
@jwt_required()
def get_images():
    conn = None
    try:
        current_user = get_jwt_identity()
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT UP.path, ProcessedImages.id_pimage
                FROM ProcessedImages
                JOIN identity ON user_id = identity.id
                JOIN UnprocessedImages AS UP ON ProcessedImages.id_uimage = UP.id_uimage
                WHERE identity.username = %s
            """, (current_user,))
            rows = cursor.fetchall()
            image_files = [{"path": row[0], "id": row[1]} for row in rows]
        return jsonify({"files": image_files}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error fetching images"}), 500
    finally:
        if conn is not None:
            conn.close()


@app.route('/api/get_thumbnail/<path:image_path>', methods=['GET'])
@jwt_required()
def get_thumbnail(image_path):
    conn = None
    try:
        current_user = get_jwt_identity()

        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("SELECT identity.username FROM ProcessedImages JOIN identity ON user_id = identity.id JOIN UnprocessedImages AS UP ON UP.id_uimage = ProcessedImages.id_uimage WHERE UP.path = %s OR ProcessedImages.path = %s", (image_path, image_path))
            row = cursor.fetchone()

            if row and row[0] == current_user:
                full_path = image_path
                if os.path.exists(full_path):
                    image = Image.open(full_path)
                    image.thumbnail((200, 200))
                    img_io = io.BytesIO()
                    image.save(img_io, 'JPEG', quality=70)
                    img_io.seek(0)
                    return send_file(img_io, mimetype='image/jpeg')
                else:
                    print("File not found")  # Log file not found
                    return jsonify({"message": "File not found"}), 404
            else:
                print("Unauthorized access")  # Log unauthorized access
                return jsonify({"message": "Unauthorized access"}), 403
    except Exception as e:
        print(f"Exception: {e}")  # Log exception
        return jsonify({"message": "Error generating thumbnail"}), 500
    finally:
        if conn is not None:
            conn.close()
@app.route("/api/get_image_pair/<string:id>", methods=['GET'])
@jwt_required()
def get_image_pair(id):
    conn = None

    try:
        current_user = get_jwt_identity()
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM identity WHERE username = %s", (current_user,))
            user_id = cursor.fetchone()

            if not user_id:
                return jsonify({"message": "User not found"}), 404


            cursor.execute("""
                SELECT ProcessedImages.path as after_img, UnprocessedImages.path as before_img,
                ProcessedImages.avg_score, ProcessedImages.objects_identified, ProcessedImages.date_uploaded
                FROM ProcessedImages
                JOIN UnprocessedImages ON ProcessedImages.id_uimage = UnprocessedImages.id_uimage
                WHERE ProcessedImages.id_pimage = %s AND ProcessedImages.user_id = %s
            """, (id, user_id[0]))

            image_data = cursor.fetchone()
            if not image_data:
                return jsonify({"message": "Image not found"}), 404

            before_recognition_path = image_data[1]
            after_recognition_path = image_data[0]
            avg_score = image_data[2]
            objects_identified = image_data[3]
            date_uploaded = image_data[4]
            filename = os.path.basename(after_recognition_path).removeprefix("RECOGNIZED_")
            return jsonify({
                "before_img_url": request.host_url + 'api/get_image/' + before_recognition_path,
                "after_img_url": request.host_url + 'api/get_image/' + after_recognition_path,
                "avg_score": avg_score,
                "objects_identified": objects_identified,
                "date_uploaded": date_uploaded,
                "filename": filename
            }), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Error fetching images"}), 500
    finally:
        if conn is not None:
            conn.close()
@app.route("/api/get_user_data", methods=['GET'])
@jwt_required()
def get_user_data():
    conn = None
    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    identity.id, 
                    identity.username, 
                    identity.email, 
                    identity.access_level, 
                    identity.last_login, 
                    identity.account_created, 
                    pi.path, 
                    pi.date_uploaded, 
                    pi.avg_score, 
                    pi.objects_identified,
                    identity.max_boxes
                FROM 
                    identity 
                LEFT JOIN 
                    ProcessedImages as pi 
                ON 
                    identity.id = pi.user_id 
                WHERE 
                    identity.username = %s
                ORDER BY 
                    pi.date_uploaded DESC 
                LIMIT 1
            """, (get_jwt_identity(),))


            user_data = cursor.fetchone()
            if not user_data:
                return jsonify({"message": "User not found"}), 404

            return jsonify({
                "id": user_data[0],
                "email": user_data[2],
                "username": user_data[1],
                "account_created": user_data[5],
                "last_login": user_data[4],
                "access_level": user_data[3],
                "last_image": {
                    "filename": os.path.basename(user_data[6]).removeprefix("RECOGNIZED_") if user_data[6] else None,
                    "date_uploaded": user_data[7] if user_data[7] else None,
                    "avg_score": user_data[8] if user_data[8] else None,
                    "objects_identified": user_data[9] if user_data[9] else None
                },
                "max_boxes": user_data[10]
            }), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error fetching user data"}), 500
    finally:
        if conn is not None:
            conn.close()

@app.route("/api/update_max_boxes", methods=['POST'])
@jwt_required()
def update_max_boxes():
    data = request.get_json()
    max_boxes = data.get('max_boxes')
    conn = None
    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.callproc("UpdateMaxBoxes", (max_boxes, get_jwt_identity()))
            conn.commit()
            return jsonify({"message": "Max boxes updated"}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Error updating max boxes"}), 500
    finally:
        if conn is not None:
            conn.close()
import os
from flask import send_file
from flask_jwt_extended import jwt_required, get_jwt_identity

@app.route('/api/get_image/<path:image_path>', methods=['GET'])
@jwt_required()
def get_image(image_path):
    conn = None
    try:
        current_user = get_jwt_identity()
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("SELECT identity.username FROM ProcessedImages JOIN identity ON user_id = identity.id JOIN UnprocessedImages AS UP ON UP.id_uimage = ProcessedImages.id_uimage  WHERE UP.path = %s OR ProcessedImages.path = %s", (image_path, image_path))
            row = cursor.fetchone()
            if row and row[0] == current_user:
                full_path = image_path
                if os.path.exists(full_path):
                    return send_file(full_path, as_attachment=False)
                else:
                    return jsonify({"message": "File not found"}), 404
            else:
                return jsonify({"message": "Unauthorized access"}), 403
    except Exception as e:
        print(e)
        return jsonify({"message": "Error sending image"}), 500
    finally:
        if conn is not None:
            conn.close()

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        email = data['email']
        username = data['username']
        password = data['password']
    except Exception as e:
        print(e)
        return jsonify({"message": "Invalid data"}), 400
    try:
        validation_error = validate_data(data, ['email', 'username', 'password'])
        if validation_error:
            print(f"Validation error: {validation_error}")
            return validation_error
        print("Data validated")
    except Exception as e:
        print(e)
        return jsonify({"message": "Invalid data"}), 400
    conn = None
    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("SELECT email FROM identity WHERE email = %s", (email,))
            row = cursor.fetchone()
            if row:
                print("Email already exists")
                return jsonify({"message": "Email already exists"}), 400
            cursor.execute("SELECT username FROM identity WHERE username = %s", (username,))
            row = cursor.fetchone()
            if row:
                print("Username already exists")
                return jsonify({"message": "Username already exists"}), 400

            print("Creating user")
            hashed_password = bc.hashpw(password.encode('utf-8'), bc.gensalt())
            print(hashed_password)
            cursor.execute(
                "INSERT INTO identity (id, email, username, password_hash, account_created) VALUES (%s, %s, %s, %s, %s)",
                (generate_user_id(), email, username, hashed_password, datetime.now()))

            conn.commit()
            print("User created correctly")
            return jsonify({"message": "User created"}), 201
    except mariadb.Error as e:
        print(f"Error: {e}")
        return jsonify({"message": "Database error"}), 500
    finally:
        if conn is not None:
            conn.close()


if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=8000, debug=True, allow_unsafe_werkzeug=True)

# add progress to frontend, integrate with backend
# after detection display the image on website
# add images to archive and display their data